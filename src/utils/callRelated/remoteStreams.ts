let remoteStream: MediaStream | null = null;

export function setRemoteStream(stream: MediaStream) {
  remoteStream = stream;
}

export function getRemoteStream() {
  return remoteStream;
}
