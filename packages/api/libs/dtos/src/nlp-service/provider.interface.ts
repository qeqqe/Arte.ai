export interface NlpProvider {
  generateDataResponse(request: any): Promise<any>;
}
