declare module "pdf-parse" {
  function pdfParse(dataBuffer: Buffer | any): Promise<{ text: string; [key: string]: any }>;
  export default pdfParse;
}
