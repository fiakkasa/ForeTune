import { LinksService } from '../../../src/apps/numerology-calculator/services/LinksService.js';

describe('LinksService', () => {
    const config = {
        url: 'https://example.com/numerology/{0}',
        queryParameterName: 'text'
    };
    let service;

    beforeEach(() => {
        service = new LinksService(config);
    });

    describe('isEligible', () => {
        it('returns true for non-empty strings with length <= 3', () => {
            expect(service.isEligible('1')).toBeTrue();
            expect(service.isEligible('12')).toBeTrue();
            expect(service.isEligible('123')).toBeTrue();
        });

        it('returns false for empty strings', () => {
            expect(service.isEligible('')).toBeFalse();
        });

        it('returns false for null or undefined', () => {
            expect(service.isEligible(null)).toBeFalse();
            expect(service.isEligible(undefined)).toBeFalse();
        });

        it('returns false for strings longer than 3 characters', () => {
            expect(service.isEligible('1234')).toBeFalse();
            expect(service.isEligible('abcdef')).toBeFalse();
        });
    });

    describe('getRoute', () => {
        describe('placeholder url', () => {
            it('replaces placeholder with given value', () => {
                expect(service.getRoute('123')).toBe('https://example.com/numerology/123');
                expect(service.getRoute('A')).toBe('https://example.com/numerology/A');
            });

            it('uses empty string if value is null or undefined', () => {
                expect(service.getRoute(null)).toBe('https://example.com/numerology/');
                expect(service.getRoute(undefined)).toBe('https://example.com/numerology/');
            });

            it('uses empty string if value is empty', () => {
                expect(service.getRoute('')).toBe('https://example.com/numerology/');
            });
        });

        describe('query url', () => {
            beforeEach(() => {
                service = new LinksService({ ...config, url: '/other-app' });
            });

            it('replaces placeholder with given value', () => {
                expect(service.getRoute('123')).toEqual({
                    path: '/other-app',
                    query: { text: '123' }
                });
                expect(service.getRoute('A')).toEqual({
                    path: '/other-app',
                    query: { text: 'A' }
                });
            });

            it('uses empty string if value is null or undefined', () => {
                expect(service.getRoute(null)).toEqual({
                    path: '/other-app',
                    query: { text: '' }
                });
                expect(service.getRoute(undefined)).toEqual({
                    path: '/other-app',
                    query: { text: '' }
                });
            });

            it('uses empty string if value is empty', () => {
                expect(service.getRoute('')).toEqual({
                    path: '/other-app',
                    query: { text: '' }
                });
            });
        });
    });
});
