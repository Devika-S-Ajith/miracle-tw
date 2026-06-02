import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { getDomainIcon, getScoreChangeIcon } from './DashboardHelperFunction';


// Mock the Icon components to return identifiable elements
jest.mock('../../../../assets/icons/DomainRoundedIcons/FamilyAndSocialRelationships', () => (props) => <div data-testid="FamilyAndSocialRelationships" {...props} />);
jest.mock('../../../../assets/icons/DomainRoundedIcons/HouseholdEconomy', () => (props) => <div data-testid="HouseholdEconomy" {...props} />);
jest.mock('../../../../assets/icons/DomainRoundedIcons/LivingCondition', () => (props) => <div data-testid="LivingCondition" {...props} />);
jest.mock('../../../../assets/icons/DomainRoundedIcons/Education', () => (props) => <div data-testid="Education" {...props} />);
jest.mock('../../../../assets/icons/DomainRoundedIcons/HealthAndMentalHealth', () => (props) => <div data-testid="HealthAndMentalHealth" {...props} />);


jest.mock('../../../../assets/icons/TrendingUp', () => (props) => <div data-testid="TrendingUp" {...props} />);
jest.mock('../../../../assets/icons/TrendingDown', () => (props) => <div data-testid="TrendingDown" {...props} />);


describe('DashboardHelperFunction', () => {
   
    describe('getDomainIcon', () => {
        it('returns FamilyAndSocialRelationships for DomainIdx 1', () => {
            render(getDomainIcon(1));
            expect(screen.getByTestId('FamilyAndSocialRelationships')).toBeInTheDocument();
        });


        it('returns HouseholdEconomy for DomainIdx 2', () => {
            render(getDomainIcon(2));
            expect(screen.getByTestId('HouseholdEconomy')).toBeInTheDocument();
        });


        it('returns LivingCondition for DomainIdx 3', () => {
            render(getDomainIcon(3));
            expect(screen.getByTestId('LivingCondition')).toBeInTheDocument();
        });


        it('returns Education for DomainIdx 4', () => {
            render(getDomainIcon(4));
            expect(screen.getByTestId('Education')).toBeInTheDocument();
        });


        it('returns HealthAndMentalHealth for DomainIdx 5', () => {
            render(getDomainIcon(5));
            expect(screen.getByTestId('HealthAndMentalHealth')).toBeInTheDocument();
        });


        it('returns undefined for an invalid DomainIdx', () => {
            const result = getDomainIcon(999);
            expect(result).toBeUndefined();
        });
    });


    describe('getScoreChangeIcon', () => {
        it('returns TrendingUp when score is positive', () => {
            render(getScoreChangeIcon(10));
            expect(screen.getByTestId('TrendingUp')).toBeInTheDocument();
        });


        it('returns TrendingUp when score is a positive string', () => {
            render(getScoreChangeIcon("5.5"));
            expect(screen.getByTestId('TrendingUp')).toBeInTheDocument();
        });


        it('returns TrendingDown when score is negative', () => {
            render(getScoreChangeIcon(-5));
            expect(screen.getByTestId('TrendingDown')).toBeInTheDocument();
        });


        it('returns an em-dash when score is zero', () => {
            const { container } = render(getScoreChangeIcon(0));
            // Check for the rendered em-dash entity
            expect(container.textContent).toBe('—');
        });


        it('returns an em-dash for non-numeric values', () => {
            const { container } = render(getScoreChangeIcon('invalid'));
            expect(container.textContent).toBe('—');
        });


        it('applies the correct styling to the em-dash', () => {
            render(getScoreChangeIcon(0));
            const span = screen.getByText('—');
            expect(span).toHaveStyle('color: #191970');
            expect(span).toHaveStyle('font-size: 18px');
        });
    });
});

