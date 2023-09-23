export interface Api {
  openFileDialog: () => Promise<string | undefined>;
}
