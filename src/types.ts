/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LeadFormData {
  name: string;
  company: string;
  phone: string;
  teamSize: number;
  planType: 'mensal' | 'semestral';
}

export interface ObjectionSimulation {
  id: string;
  title: string;
  scenario: string;
  whatsappMessage: string;
  diagnosis: {
    icp: string;
    analysis: string;
    process: string;
  };
  practicalPlan: {
    scenario: string;
    action: string;
    steps: string[];
    example: string;
    obstacles: string[];
    solutions: string[];
    expectedResult: string;
  };
  postPlan: {
    script: string;
    followUp: string;
    pitch: string;
  };
}
