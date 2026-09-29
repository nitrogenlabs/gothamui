export const formatPlaybackTime = (seconds: number): string => {
  const whole = Math.floor(Math.max(0, Number.isFinite(seconds) ? seconds : 0));
  return `${String(Math.floor(whole / 60)).padStart(2, '0')}:${String(whole % 60).padStart(2, '0')}`;
};

export const playbackRatioPresets = [
  {label: '9:16', value: 9 / 16},
  {label: '3:4', value: 3 / 4},
  {label: '1:1', value: 1},
  {label: '4:3', value: 4 / 3},
  {label: '16:9', value: 16 / 9},
  {label: '21:9', value: 21 / 9}
] as const;
