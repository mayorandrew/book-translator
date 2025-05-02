import { OperatorAsyncFunction } from 'ix/interfaces';
import { ParsedElementInfo } from '@streamparser/json';
import { JSONParser } from '@streamparser/json-whatwg';
import * as ixa from 'ix/asynciterable';
import * as ixao from 'ix/asynciterable/operators';

type JsonElementInfo = ParsedElementInfo.ParsedElementInfo;

class JsonParseIterable extends ixa.AsyncIterableX<JsonElementInfo> {
  constructor(protected readonly _source: AsyncIterable<string>) {
    super();
  }

  [Symbol.asyncIterator](signal?: AbortSignal): AsyncIterator<JsonElementInfo> {
    const parser = new JSONParser();
    const parsed = ixa
      .from(ixao.wrapWithAbort(this._source, signal))
      .pipeThrough(parser);
    return ixa.fromDOMStream(parsed)[Symbol.asyncIterator](signal);
  }
}

export const jsonParse =
  (): OperatorAsyncFunction<string, JsonElementInfo> =>
  (stream: AsyncIterable<string>) =>
    new JsonParseIterable(stream);
