declare module "virtual:math-diagram-examples" {
  export interface DiagramDocumentationExample {
    id: string;
    title: string;
    description: string;
    language: string;
    source: string;
    svg: string;
  }

  export const diagramExamples: Readonly<Record<string, DiagramDocumentationExample>>;
  export function diagramExample(id: string): DiagramDocumentationExample;
  export default diagramExamples;
}

