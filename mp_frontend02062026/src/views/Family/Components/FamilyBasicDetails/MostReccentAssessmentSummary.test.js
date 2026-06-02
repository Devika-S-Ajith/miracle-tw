import React from 'react';
import { render, screen } from '@testing-library/react';
import MostRecentAssessmentSummary from './MostRecentAssessmentSummary';

describe('MostRecentAssessmentSummary', () => {
    test('renders the card title', () => {
        render(<MostRecentAssessmentSummary />);
        expect(screen.getByText(/Most Reccent Assessment Summary/i)).toBeInTheDocument();
    });

    test('renders main percentage value', () => {
        render(<MostRecentAssessmentSummary />);
        expect(screen.getByText('67.4%')).toBeInTheDocument();
    });

    test('renders score change and assessment info', () => {
        render(<MostRecentAssessmentSummary />);
        expect(screen.getByText('6.2%')).toBeInTheDocument();
        expect(screen.getByText(/\(since assessment #1\)/i)).toBeInTheDocument();
    });

    test('renders Domains section and domain percentages', () => {
        render(<MostRecentAssessmentSummary />);
        expect(screen.getByText('Domains')).toBeInTheDocument();
        expect(screen.getByText('72%')).toBeInTheDocument();
        expect(screen.getByText('65%')).toBeInTheDocument();
        expect(screen.getByText('69%')).toBeInTheDocument();
        expect(screen.getAllByText('64%').length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('60%')).toBeInTheDocument();
    });

    test('renders Milestones section and milestone values', () => {
        render(<MostRecentAssessmentSummary />);
        expect(screen.getByText('Milestones')).toBeInTheDocument();
        expect(screen.getByText('12')).toBeInTheDocument();
        expect(screen.getByText('8')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
    });

    test('renders milestone images', () => {
        render(<MostRecentAssessmentSummary />);
        // There should be 3 milestone images rendered
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThanOrEqual(3);
    });
});