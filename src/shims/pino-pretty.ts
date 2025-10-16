export default function pinoPretty() {
  return {
    pipe() {
      return this;
    }
  } as { pipe: () => unknown };
}
