import {fireEvent, render} from '@testing-library/react';
import {createRef} from 'react';

import {MessageBox} from '../MessageBox/MessageBox.js';
import {MessageList} from './MessageList.js';

vi.mock('../MessageBox/MessageBox.js', () => ({MessageBox: vi.fn(() => <div>Message</div>)}));

describe('MessageList scrolling', () => {
  it('keeps messages stable while scrolling and toggling the down button', () => {
    const referance = createRef<HTMLDivElement>();
    const onClick = vi.fn();
    const dataSource = [{id: 'one', text: 'Hello', type: 'text' as const}];
    const {container, rerender} = render(
      <MessageList dataSource={dataSource as never} downButton onClick={onClick} referance={referance} />
    );
    const scroller = referance.current!;
    Object.defineProperties(scroller, {offsetHeight: {value: 100}, scrollHeight: {value: 1000}});
    const renders = vi.mocked(MessageBox).mock.calls.length;
    for(const scrollTop of [100, 150, 200, 800, 850]) {
      scroller.scrollTop = scrollTop;
      fireEvent.scroll(scroller);
    }

    expect(MessageBox).toHaveBeenCalledTimes(renders);
    expect(container.querySelector('.rce-mlist-down-button')).toBeNull();

    scroller.scrollTop = 0;
    fireEvent.scroll(scroller);

    expect(container.querySelector('.rce-mlist-down-button')).not.toBeNull();

    const nextOnClick = vi.fn();
    rerender(<MessageList dataSource={dataSource as never} downButton onClick={nextOnClick} referance={referance} />);
    const event = {};
    vi.mocked(MessageBox).mock.calls.at(-1)![0].onClick!(event as never);

    expect(nextOnClick).toHaveBeenCalledWith(dataSource[0], 0, event);
    expect(onClick).not.toHaveBeenCalled();
  });
});

test('preserves following and locked scroll positions when messages are appended', () => {
  const referance = createRef<HTMLDivElement>();
  const dataSource = [{id: 'one', text: 'Hello', type: 'text' as const}];
  const {rerender} = render(<MessageList dataSource={dataSource as never} lockable referance={referance} />);
  const scroller = referance.current!;
  Object.defineProperties(scroller, {
    offsetHeight: {value: 100},
    scrollHeight: {configurable: true, value: 1000}
  });
  scroller.scrollTop = 900;
  fireEvent.scroll(scroller);
  Object.defineProperty(scroller, 'scrollHeight', {value: 2000});
  rerender(<MessageList dataSource={[...dataSource, {...dataSource[0], id: 'two'}] as never} lockable referance={referance} />);

  expect(scroller.scrollTop).toBe(2000);

  scroller.scrollTop = 1000;
  fireEvent.scroll(scroller);
  Object.defineProperty(scroller, 'scrollHeight', {value: 3000});
  rerender(<MessageList dataSource={dataSource as never} lockable referance={referance} />);

  expect(scroller.scrollTop).toBe(2000);
});
