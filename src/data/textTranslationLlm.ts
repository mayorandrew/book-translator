export interface TextTranslationLlm {
  streamTranslations(
    text: string,
    targetLanguage: string,
    signal?: AbortSignal,
  ): AsyncIterable<string>;
}
