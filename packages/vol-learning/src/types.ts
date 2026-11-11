/**
 * University Laboratory Practice Specification for VOL.
 */

export type LabMode = 'guided' | 'free' | 'challenge';

export interface PracticeStep {
  stepNumber: number;
  title: string;
  instruction: string;
  targetParameter?: string;
  expectedCondition?: string;
  hint?: string;
}

export interface PracticeChallenge {
  id: string;
  title: string;
  description: string;
  targetMetric: string;
  targetValue: number;
  tolerance: number;
  initialParams: Record<string, number | string>;
  solutionExplanation: string;
}

export interface UniversityLabPractice {
  id: string;
  stationId: 'geometric' | 'lenses' | 'wave' | 'polarization' | 'laser' | 'photonics';
  status: 'active' | 'roadmap';
  // 1. Title
  title: string;
  // 2. Academic level
  academicLevel: 'Undergraduate Physics I' | 'Undergraduate Physics II' | 'Advanced Optical Engineering';
  // 3. Learning objectives
  learningObjectives: string[];
  // 4. Scientific theory
  theory: string;
  // 5. Required instruments
  instruments: string[];
  // 6. Safety considerations
  safety: string[];
  // 7. Experimental setup
  setupDescription: string;
  // 8. Step-by-step procedure
  procedure: PracticeStep[];
  // 9. Configurable variables
  configurableVariables: Array<{
    name: string;
    key: string;
    unit: string;
    min: number;
    max: number;
    step: number;
    defaultValue: number | string;
  }>;
  // 10. Measurements
  measurementFields: Array<{
    name: string;
    symbol: string;
    unit: string;
  }>;
  // 11. Mathematical model
  mathematicalModel: string[];
  // 12. Expected results
  expectedResults: string;
  // 13. Experimental analysis
  analysisGuidelines: string;
  // 14. Discussion questions
  discussionQuestions: string[];
  // 15. Conclusions
  conclusions: string;
  challenges: PracticeChallenge[];
}
