import { describe, test, expect } from 'vitest';
import { PUBLIC_MILESTONES, MILESTONE_REVIEW_DATE } from '../../src/data/milestones';
import { EVIDENCE_STATUS_DEFINITIONS, definitionOf } from '../../src/data/evidence-status';
import { RESEARCH_PROGRAMS } from '../../src/data/research-programs';
import { CONSUMER_PRODUCTS } from '../../src/data/products';

const PUBLICATION_DATE = '2026-10-20';

describe('public milestone manifest', () => {
  test('every milestone has a unique identifier and belongs to a published program', () => {
    const identifiers = PUBLIC_MILESTONES.map((milestone) => milestone.id);
    expect(new Set(identifiers).size).toBe(identifiers.length);
    const programIds = new Set(RESEARCH_PROGRAMS.map((program) => program.id));
    for (const milestone of PUBLIC_MILESTONES) expect(programIds.has(milestone.programId)).toBe(true);
  });

  test('every milestone states what is and is not demonstrated, and the next observable result', () => {
    for (const milestone of PUBLIC_MILESTONES) {
      expect(milestone.demonstrated.length, milestone.id).toBeGreaterThan(0);
      expect(milestone.notDemonstrated.length, milestone.id).toBeGreaterThan(0);
      expect(milestone.nextObservableResult.length, milestone.id).toBeGreaterThan(10);
      expect(milestone.explanation.length, milestone.id).toBeGreaterThan(20);
    }
  });

  test('no milestone uses a percentage or progress figure', () => {
    for (const milestone of PUBLIC_MILESTONES) {
      const allText = [milestone.title, milestone.explanation, ...milestone.demonstrated, ...milestone.notDemonstrated, milestone.nextObservableResult, ...milestone.limitations].join(' ');
      expect(allText, milestone.id).not.toMatch(/\d\s?%|percent/i);
    }
  });

  test('review dates are real dates and never in the future of publication', () => {
    expect(MILESTONE_REVIEW_DATE).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    for (const milestone of PUBLIC_MILESTONES) {
      expect(milestone.lastReviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(milestone.lastReviewed <= PUBLICATION_DATE, milestone.id).toBe(true);
    }
  });

  test('nothing claims independent or production evidence, because none exists', () => {
    for (const milestone of PUBLIC_MILESTONES) {
      expect(milestone.evidenceScope, milestone.id).not.toBe('independent');
      expect(['independently-verified', 'production-qualified'], milestone.id).not.toContain(milestone.status);
    }
  });

  test('a milestone with no evidence is never shown with a tested status', () => {
    for (const milestone of PUBLIC_MILESTONES) {
      if (milestone.evidenceScope === 'none') {
        expect(['internally-tested', 'internally-validated'], milestone.id).not.toContain(milestone.status);
      }
    }
  });

  test('the independent evaluation milestones remain not demonstrated', () => {
    const evaluationMilestones = PUBLIC_MILESTONES.filter((milestone) => milestone.id.endsWith('independent-evaluation'));
    expect(evaluationMilestones.length).toBe(2);
    for (const milestone of evaluationMilestones) expect(milestone.status).toBe('not-yet-demonstrated');
  });

  test('net size reduction is not presented as demonstrated', () => {
    expect(PUBLIC_MILESTONES.find((milestone) => milestone.id === 'representation-net-reduction')?.status).toBe('not-yet-demonstrated');
  });
});

describe('evidence status taxonomy', () => {
  test('every status used is defined, and independent scope belongs only to independent statuses', () => {
    for (const milestone of PUBLIC_MILESTONES) expect(() => definitionOf(milestone.status)).not.toThrow();
    for (const definition of EVIDENCE_STATUS_DEFINITIONS) {
      const independent = definition.status === 'independently-verified' || definition.status === 'production-qualified';
      expect(definition.evidenceScope === 'independent').toBe(independent);
    }
  });
});

describe('product registry', () => {
  test('no product is described as available or for sale', () => {
    for (const product of CONSUMER_PRODUCTS) {
      expect(product.availability).not.toBe('available');
      expect(product.whatDoesNotExist.length).toBeGreaterThan(0);
      const text = [product.oneLine, product.availabilityDetail, ...product.whatExistsToday].join(' ').toLowerCase();
      for (const phrase of ['buy now', 'order now', 'in stock', 'ships ', 'available now']) expect(text).not.toContain(phrase);
    }
  });
});
