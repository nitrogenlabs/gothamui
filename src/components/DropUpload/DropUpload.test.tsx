import {fireEvent, render, screen, waitFor} from '@testing-library/react';

import {DropUpload} from './DropUpload.js';

describe('DropUpload', () => {
  beforeEach(() => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:gotham-preview');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders default files and removes them from the preview list', async () => {
    const file = new File(['hello'], 'avatar.png', {type: 'image/png'});
    const onFilesChange = vi.fn();

    render(<DropUpload defaultFiles={[file]} onFilesChange={onFilesChange} />);

    expect(screen.getByText('avatar.png')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: 'Remove avatar.png'}));

    await waitFor(() => expect(onFilesChange).toHaveBeenCalledWith([], []));
  });

  it('adds accepted files from the file input', async () => {
    const file = new File(['hello'], 'notes.txt', {type: 'text/plain'});
    const onFilesChange = vi.fn();

    render(<DropUpload accept=".txt" onFilesChange={onFilesChange} />);

    fireEvent.change(screen.getByLabelText('browse'), {target: {files: [file]}});

    await waitFor(() => expect(onFilesChange).toHaveBeenCalledWith(
      [file],
      [expect.objectContaining({file})]
    ));
  });

  it('rejects files that do not match accept rules', async () => {
    const file = new File(['hello'], 'notes.txt', {type: 'text/plain'});
    const onReject = vi.fn();

    render(<DropUpload accept="image/*" onReject={onReject} />);

    fireEvent.change(screen.getByLabelText('browse'), {target: {files: [file]}});

    await waitFor(() => expect(onReject).toHaveBeenCalledWith([
      {file, reason: 'type'}
    ]));
  });

  it('rejects files when max file count is reached', async () => {
    const small = new File(['a'], 'small.txt', {type: 'text/plain'});
    const large = new File(['too-large'], 'large.txt', {type: 'text/plain'});
    const onReject = vi.fn();

    render(
      <DropUpload
        defaultFiles={[small]}
        maxFiles={1}
        onReject={onReject}
      />
    );

    fireEvent.change(screen.getByLabelText('browse'), {target: {files: [large]}});

    await waitFor(() => expect(onReject).toHaveBeenCalledWith([
      {file: large, reason: 'max-files'}
    ]));
  });

  it('handles drag and browse file picker interactions', () => {
    const {container} = render(<DropUpload helperText="PNG or JPG" />);
    const dropZone = screen.getByRole('group');
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const click = vi.spyOn(input, 'click').mockImplementation(() => undefined);

    fireEvent.dragOver(dropZone);

    expect(dropZone).toHaveClass('border-primary');

    fireEvent.dragLeave(dropZone);
    fireEvent.click(screen.getByRole('button', {name: 'browse'}));

    expect(screen.getByText('PNG or JPG')).toBeInTheDocument();
    expect(click).toHaveBeenCalledTimes(1);
  });

  const mockClipboard = (read = vi.fn().mockResolvedValue([])) => {
    vi.stubGlobal('navigator', {clipboard: {read}});
    return read;
  };

  const imageItem = (type = 'image/png') => ({
    getType: vi.fn().mockResolvedValue(new Blob(['image'], {type})),
    types: ['text/html', type]
  });

  it('reads one image per clipboard item and shows a removable preview', async () => {
    const item = imageItem();
    item.types.push('image/jpeg');
    const read = mockClipboard(vi.fn().mockResolvedValue([item]));
    const onFilesChange = vi.fn();
    render(<DropUpload accept="image/*" onFilesChange={onFilesChange} />);

    fireEvent.click(screen.getByRole('button', {name: 'Paste image'}));

    await waitFor(() => expect(onFilesChange).toHaveBeenCalledTimes(1));

    expect(read).toHaveBeenCalledTimes(1);
    expect(item.getType).toHaveBeenCalledTimes(1);
    expect(onFilesChange.mock.calls[0][0]).toEqual([
      expect.objectContaining({name: 'clipboard-image-1.png', type: 'image/png'})
    ]);
    expect(screen.getByAltText('clipboard-image-1.png')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: 'Remove clipboard-image-1.png'}));

    expect(onFilesChange).toHaveBeenLastCalledWith([], []);
  });

  it.each([
    [{accept: '.jpg'}, 'type'],
    [{maxFileSize: 1}, 'max-size'],
    [{maxFiles: 0}, 'max-files']
  ] as const)('validates pasted images using %j', async (props, reason) => {
    mockClipboard(vi.fn().mockResolvedValue([imageItem()]));
    const onFilesChange = vi.fn();
    const onReject = vi.fn();
    render(<DropUpload {...props} onFilesChange={onFilesChange} onReject={onReject} />);
    fireEvent.click(screen.getByRole('button', {name: 'Paste image'}));

    await waitFor(() => expect(onReject).toHaveBeenCalledWith([
      {file: expect.any(File), reason}
    ]));

    expect(onFilesChange).not.toHaveBeenCalled();
  });

  it('accepts only one image when multiple is false', async () => {
    mockClipboard(vi.fn().mockResolvedValue([imageItem(), imageItem()]));
    const onFilesChange = vi.fn();
    render(<DropUpload multiple={false} onFilesChange={onFilesChange} />);
    fireEvent.click(screen.getByRole('button', {name: 'Paste image'}));
    await waitFor(() => expect(onFilesChange).toHaveBeenCalledTimes(1));

    expect(onFilesChange.mock.calls[0][0]).toHaveLength(1);
  });

  it('explains empty, denied, and unavailable clipboard access', async () => {
    const read = mockClipboard();
    render(<DropUpload />);
    const button = screen.getByRole('button', {name: 'Paste image'});
    fireEvent.click(button);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('No image found'));

    read.mockRejectedValue(new Error('Denied'));
    fireEvent.click(button);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Could not paste'));

    vi.stubGlobal('navigator', {});
    fireEvent.click(button);

    expect(screen.getByRole('status')).toHaveTextContent('Clipboard access is unavailable');
  });

  it('supports keyboard paste without clipboard read permission and clears feedback', async () => {
    vi.stubGlobal('navigator', {});
    const onFilesChange = vi.fn();
    render(<DropUpload onFilesChange={onFilesChange} />);
    fireEvent.click(screen.getByRole('button', {name: 'Paste image'}));
    const file = new File(['image'], 'pasted.png', {type: 'image/png'});
    fireEvent.paste(screen.getByRole('group'), {clipboardData: {files: [file]}});
    await waitFor(() => expect(onFilesChange).toHaveBeenCalledWith([file], [expect.objectContaining({file})]));

    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('allows a consumer to cancel keyboard paste', () => {
    const onFilesChange = vi.fn();
    render(<DropUpload onFilesChange={onFilesChange} onPaste={(event) => event.preventDefault()} />);
    fireEvent.paste(screen.getByRole('group'), {clipboardData: {files: [new File(['a'], 'a.png', {type: 'image/png'})]}});

    expect(onFilesChange).not.toHaveBeenCalled();
  });

  it('does not read the clipboard while disabled and supports hiding the button', () => {
    const read = mockClipboard();
    const {rerender} = render(<DropUpload disabled />);
    fireEvent.click(screen.getByRole('button', {name: 'Paste image'}));

    expect(read).not.toHaveBeenCalled();

    rerender(<DropUpload showPasteButton={false} />);

    expect(screen.queryByRole('button', {name: 'Paste image'})).not.toBeInTheDocument();
  });

  it('prevents duplicate reads and respects disabling while access is pending', async () => {
    let finishRead!: (items: ReturnType<typeof imageItem>[]) => void;
    const read = mockClipboard(vi.fn().mockReturnValue(new Promise((resolve) => {
      finishRead = resolve;
    })));
    const onFilesChange = vi.fn();
    const {rerender} = render(<DropUpload onFilesChange={onFilesChange} />);
    const button = screen.getByRole('button', {name: 'Paste image'});
    fireEvent.click(button);
    fireEvent.click(button);

    expect(read).toHaveBeenCalledTimes(1);
    expect(button).toBeDisabled();

    rerender(<DropUpload disabled onFilesChange={onFilesChange} />);
    finishRead([imageItem()]);
    await waitFor(() => expect(button).toHaveAttribute('aria-busy', 'false'));

    expect(onFilesChange).not.toHaveBeenCalled();
  });

  it('preserves controlled files added while clipboard permission is pending', async () => {
    let finishRead!: (items: ReturnType<typeof imageItem>[]) => void;
    mockClipboard(vi.fn().mockReturnValue(new Promise((resolve) => {
      finishRead = resolve;
    })));
    const onFilesChange = vi.fn();
    const {rerender} = render(<DropUpload files={[]} onFilesChange={onFilesChange} />);
    fireEvent.click(screen.getByRole('button', {name: 'Paste image'}));
    const existing = new File(['a'], 'existing.png', {type: 'image/png'});
    rerender(<DropUpload files={[existing]} onFilesChange={onFilesChange} />);
    finishRead([imageItem()]);
    await waitFor(() => expect(onFilesChange).toHaveBeenCalledTimes(1));

    expect(onFilesChange.mock.calls[0][0]).toEqual([existing, expect.objectContaining({name: 'clipboard-image-1.png'})]);
  });

  it('resizes clipboard images before notifying the consumer', async () => {
    mockClipboard(vi.fn().mockResolvedValue([imageItem()]));
    vi.stubGlobal('Image', class {
      decode = vi.fn().mockResolvedValue(undefined);
      height = 100;
      width = 200;
    });
    const drawImage = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({drawImage} as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => callback(new Blob(['resized'], {type: 'image/jpeg'})));
    const onFilesChange = vi.fn();
    render(<DropUpload imageResizeTargetWidth={50} onFilesChange={onFilesChange} />);
    fireEvent.click(screen.getByRole('button', {name: 'Paste image'}));
    await waitFor(() => expect(onFilesChange).toHaveBeenCalledTimes(1));

    expect(drawImage).toHaveBeenCalledWith(expect.objectContaining({height: 100, width: 200}), 0, 0, 50, 25);
    expect(onFilesChange.mock.calls[0][0][0].type).toBe('image/jpeg');
  });
});
