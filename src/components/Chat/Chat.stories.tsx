import React, {useRef} from 'react';
import {Phone, Video} from 'lucide-react';
import {interactWithCanvas} from '../../utils/storyInteractions.js';
import {
  AudioMessage,
  Avatar,
  Button,
  ChatItem,
  ChatList,
  Circle,
  Dropdown,
  FileMessage,
  Input,
  LocationMessage,
  MeetingItem,
  MeetingLink,
  MeetingList,
  MeetingMessage,
  MessageBox,
  MessageList,
  Navbar,
  PhotoMessage,
  Popup,
  ReplyMessage,
  SideBar,
  SpotifyMessage,
  SystemMessage,
  VideoMessage
} from './index.js';

import type {Meta, StoryObj} from '@nlabs/lex/storybook';

const noop = () => undefined;
const avatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="%233979aa"/><text x="48" y="56" text-anchor="middle" fill="white" font-size="28">G</text></svg>';
const media = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="%23e5e7eb"/><text x="160" y="96" text-anchor="middle" fill="%23111827" font-size="24">Preview</text></svg>';

const baseMessage = {
  avatar,
  focus: false,
  forwarded: false,
  id: 'message-1',
  notch: true,
  position: 'left',
  removeButton: false,
  replyButton: true,
  retracted: false,
  status: 'sent',
  text: 'Storybook message',
  title: 'Gotham',
  titleColor: '#3979aa',
  type: 'text'
} as const;

const chatItem = {
  avatar,
  dateString: 'Now',
  id: 'chat-1',
  muted: false,
  showMute: true,
  showVideoCall: true,
  statusColor: '#22c55e',
  subtitle: 'Stories now cover the chat components.',
  title: 'GothamUI'
};

const meetingItem = {
  avatars: [
    {alt: 'Bruce', src: avatar},
    {alt: 'Selina', src: avatar}
  ],
  dateString: '10:30 AM',
  id: 'meeting-1',
  subject: 'Storybook coverage review'
};

const controls = {
  className: {
    control: 'text'
  },
  text: {
    control: 'text'
  }
};

const meta: Meta = {
  parameters: {
    layout: 'centered'
  },
  title: 'Components/Chat'
};

export default meta;

type Story = StoryObj<Record<string, unknown>>;

export const ChatAvatar: Story = {
  argTypes: {
    alt: {control: 'text'},
    size: {control: 'select', options: ['xsmall', 'small', 'medium', 'large', 'xlarge']},
    src: {control: 'text'},
    type: {control: 'select', options: ['default', 'circle']}
  },
  args: {
    alt: 'Gotham avatar',
    size: 'large',
    src: avatar,
    type: 'circle'
  },
  play: interactWithCanvas,
  render: (args: Record<string, unknown>) => <Avatar {...(args as any)} />
};

export const ChatButton: Story = {
  argTypes: {
    backgroundColor: {control: 'color'},
    color: {control: 'color'},
    disabled: {control: 'boolean'},
    text: {control: 'text'}
  },
  args: {
    backgroundColor: '#3979aa',
    color: '#ffffff',
    disabled: false,
    text: 'Send'
  },
  play: interactWithCanvas,
  render: (args: Record<string, unknown>) => <Button {...(args as any)} />
};

export const ChatInput: Story = {
  argTypes: {
    autofocus: {control: 'boolean'},
    multiline: {control: 'boolean'},
    placeholder: {control: 'text'},
    value: {control: 'text'}
  },
  args: {
    autofocus: false,
    maxHeight: 140,
    multiline: false,
    placeholder: 'Type a message',
    value: ''
  },
  play: interactWithCanvas,
  render: (args: Record<string, unknown>) => <Input {...(args as any)} />
};

export const ChatNavbar: Story = {
  argTypes: {
    type: {control: 'select', options: ['light', 'dark']}
  },
  args: {
    center: 'Messages',
    left: 'GothamUI',
    right: <Video size={18} />,
    type: 'light'
  },
  play: interactWithCanvas,
  render: (args: Record<string, unknown>) => <Navbar {...(args as any)} />
};

export const ChatSideBar: Story = {
  argTypes: {
    type: {control: 'select', options: ['light', 'dark']}
  },
  args: {
    data: {
      bottom: 'Settings',
      center: 'Threads',
      top: 'Inbox'
    },
    type: 'dark'
  },
  play: interactWithCanvas,
  render: (args: Record<string, unknown>) => <SideBar {...(args as any)} />
};

export const ChatDropdown: Story = {
  argTypes: {
    animationPosition: {control: 'select', options: ['nortwest', 'norteast', 'southwest', 'southeast']},
    title: {control: 'text'}
  },
  args: {
    animationPosition: 'nortwest',
    buttonProps: {text: 'Actions'},
    items: ['Archive', 'Mute', 'Delete'],
    onSelect: noop,
    title: 'Conversation'
  },
  play: interactWithCanvas,
  render: (args: Record<string, unknown>) => <Dropdown {...(args as any)} />
};

export const ChatPopup: Story = {
  argTypes: {
    popup: {control: 'object'},
    type: {control: 'select', options: ['default', 'dark']}
  },
  args: {
    popup: {
      footerButtons: [{text: 'Close', onClick: noop}],
      header: 'Confirm action',
      show: true,
      text: 'This popup is open for interaction coverage.'
    },
    type: 'default'
  },
  play: interactWithCanvas,
  render: (args: Record<string, unknown>) => <Popup {...(args as any)} />
};

export const ChatItemStory: Story = {
  argTypes: {
    muted: {control: 'boolean'},
    subtitle: {control: 'text'},
    title: {control: 'text'},
    unread: {control: 'number'}
  },
  args: chatItem,
  play: interactWithCanvas,
  render: (args: Record<string, unknown>) => <ChatItem {...(args as any)} />
};

export const ChatListStory: Story = {
  argTypes: {
    dataSource: {control: 'object'}
  },
  args: {
    dataSource: [chatItem, {...chatItem, id: 'chat-2', subtitle: 'A second conversation', title: 'Design Systems', unread: 2}],
    id: 'chat-list',
    lazyLoadingImage: avatar
  },
  play: interactWithCanvas,
  render: (args: Record<string, unknown>) => <ChatList {...(args as any)} />
};

export const ProgressCircle: Story = {
  argTypes: {
    animate: {control: {max: 1, min: 0, step: 0.1, type: 'range'}},
    progressOptions: {control: 'object'}
  },
  args: {
    animate: 0.65,
    progressOptions: {
      color: '#3979aa',
      strokeWidth: 6,
      trailColor: '#d1d5db'
    }
  },
  play: interactWithCanvas,
  render: (args: Record<string, unknown>) => <Circle {...(args as any)} />
};

export const ReplyMessageStory: Story = {
  argTypes: controls,
  args: {
    ...baseMessage,
    message: 'Previous message content',
    photoURL: '',
    title: 'Bruce Wayne'
  },
  play: interactWithCanvas,
  render: (args: Record<string, unknown>) => <ReplyMessage {...(args as any)} />
};

export const SystemMessageStory: Story = {
  argTypes: controls,
  args: {
    ...baseMessage,
    text: 'Today'
  },
  play: interactWithCanvas,
  render: (args: Record<string, unknown>) => <SystemMessage {...(args as any)} />
};

export const PhotoMessageStory: Story = {
  argTypes: {
    data: {control: 'object'},
    text: {control: 'text'}
  },
  args: {
    ...baseMessage,
    data: {
      alt: 'Preview',
      height: 180,
      status: {download: true},
      uri: media,
      width: 320
    },
    text: 'Photo attachment',
    type: 'photo'
  },
  play: interactWithCanvas,
  render: (args: Record<string, unknown>) => <PhotoMessage {...(args as any)} />
};

export const VideoMessageStory: Story = {
  argTypes: {
    controlsList: {control: 'text'},
    data: {control: 'object'},
    text: {control: 'text'}
  },
  args: {
    ...baseMessage,
    controlsList: 'nodownload',
    data: {
      alt: 'Video preview',
      height: 180,
      status: {download: false},
      uri: media,
      width: 320
    },
    text: 'Video attachment',
    type: 'video'
  },
  play: interactWithCanvas,
  render: (args: Record<string, unknown>) => <VideoMessage {...(args as any)} />
};

export const AudioMessageStory: Story = {
  argTypes: {
    data: {control: 'object'},
    text: {control: 'text'}
  },
  args: {
    ...baseMessage,
    data: {
      audioType: 'audio/mp3',
      audioURL: ''
    },
    text: 'Audio note',
    type: 'audio'
  },
  play: interactWithCanvas,
  render: (args: Record<string, unknown>) => <AudioMessage {...(args as any)} />
};

export const FileMessageStory: Story = {
  argTypes: {
    data: {control: 'object'},
    text: {control: 'text'}
  },
  args: {
    ...baseMessage,
    data: {
      name: 'release-notes.pdf',
      size: '128 KB',
      status: {download: false}
    },
    text: 'release-notes.pdf',
    type: 'file'
  },
  play: interactWithCanvas,
  render: (args: Record<string, unknown>) => <FileMessage {...(args as any)} />
};

export const LocationMessageStory: Story = {
  argTypes: {
    data: {control: 'object'},
    text: {control: 'text'},
    zoom: {control: 'text'}
  },
  args: {
    ...baseMessage,
    apiKey: 'demo',
    data: {
      latitude: '40.7128',
      longitude: '-74.0060',
      staticURL: media
    },
    href: '#map',
    markerColor: 'blue',
    text: 'Gotham City',
    type: 'location',
    zoom: '13'
  },
  play: interactWithCanvas,
  render: (args: Record<string, unknown>) => <LocationMessage {...(args as any)} />
};

export const SpotifyMessageStory: Story = {
  argTypes: {
    height: {control: 'number'},
    uri: {control: 'text'},
    width: {control: 'number'}
  },
  args: {
    ...baseMessage,
    height: 120,
    type: 'spotify',
    uri: 'track/11dFghVXANMlKmJXsNCbNl',
    width: 300
  },
  play: interactWithCanvas,
  render: (args: Record<string, unknown>) => <SpotifyMessage {...(args as any)} />
};

export const MeetingItemStory: Story = {
  argTypes: {
    subject: {control: 'text'},
    subjectLimit: {control: 'number'}
  },
  args: meetingItem,
  play: interactWithCanvas,
  render: (args: Record<string, unknown>) => <MeetingItem {...(args as any)} />
};

export const MeetingListStory: Story = {
  argTypes: {
    dataSource: {control: 'object'}
  },
  args: {
    dataSource: [meetingItem, {...meetingItem, id: 'meeting-2', subject: 'Design review'}],
    lazyLoadingImage: avatar
  },
  play: interactWithCanvas,
  render: (args: Record<string, unknown>) => <MeetingList {...(args as any)} />
};

export const MeetingLinkStory: Story = {
  argTypes: {
    meetingID: {control: 'text'},
    text: {control: 'text'}
  },
  args: {
    ...baseMessage,
    actionButtons: [{Component: () => <Phone size={16} />, onClickButton: noop}],
    meetingID: 'daily-sync',
    text: 'Join daily sync',
    type: 'meetingLink'
  },
  play: interactWithCanvas,
  render: (args: Record<string, unknown>) => <MeetingLink {...(args as any)} />
};

export const MeetingMessageStory: Story = {
  argTypes: {
    participants: {control: 'object'},
    subject: {control: 'text'}
  },
  args: {
    ...baseMessage,
    dataSource: [],
    participants: [{id: 1, title: 'Bruce'}, {id: 2, title: 'Selina'}],
    subject: 'Component review',
    type: 'meeting'
  },
  play: interactWithCanvas,
  render: (args: Record<string, unknown>) => <MeetingMessage {...(args as any)} />
};

export const MessageBoxStory: Story = {
  argTypes: {
    position: {control: 'select', options: ['left', 'right']},
    text: {control: 'text'},
    type: {control: 'select', options: ['text', 'photo', 'file', 'location', 'audio', 'video', 'spotify', 'meeting', 'meetingLink']}
  },
  args: baseMessage,
  play: interactWithCanvas,
  render: (args: Record<string, unknown>) => <MessageBox {...(args as any)} />
};

export const MessageListStory: Story = {
  argTypes: {
    dataSource: {control: 'object'},
    lockable: {control: 'boolean'}
  },
  args: {
    dataSource: [baseMessage, {...baseMessage, id: 'message-2', position: 'right', text: 'Reply from Storybook'}],
    lockable: false,
    referance: undefined
  },
  play: interactWithCanvas,
  render: (args: Record<string, unknown>) => {
    const ref = useRef<HTMLDivElement>(null);
    return <MessageList {...(args as any)} referance={ref} />;
  }
};
