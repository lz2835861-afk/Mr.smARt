/**
 * 可选依赖的最小类型声明。mammoth / pdf-parse 通过动态 import() 可选加载：
 * 生产环境 install 后即有真实类型；本地/受限环境未装时，这里的声明避免
 * `tsc -b` 因“找不到模块”而失败。运行时若真的缺失，_extract.ts 里已做 try/catch 兜底。
 *
 * 注意：真实的 mammoth 会带自己的类型；同名声明会被合并/覆盖，不影响生产。
 */
declare module "mammoth" {
  export function extractRawText(input: { buffer: Buffer }): Promise<{ value: string; messages: unknown[] }>;
  const _default: { extractRawText: typeof extractRawText };
  export default _default;
}

declare module "pdf-parse" {
  interface PdfParseResult {
    text: string;
    numpages?: number;
    info?: unknown;
  }
  function pdfParse(dataBuffer: Buffer): Promise<PdfParseResult>;
  export default pdfParse;
}
