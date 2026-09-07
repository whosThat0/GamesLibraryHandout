/// <reference types="cypress" />

/**
 * E2E-Tests fuer robuste Suche und bewusstes Submit-Verhalten.
 */
describe('Such-Randfaelle', () => {
  beforeEach(() => {
    cy.visitApp();
  });

  it('zeigt bei Sonderzeichen entweder Treffer oder No Games Found', () => {
    cy.intercept('GET', '/api/games/search*').as('search');
    cy.get('.search-bar__input').type('Zelda % < & aeoeue');
    cy.get('.search-bar__button').click();

    cy.wait('@search').its('response.statusCode').should('eq', 200);
    cy.get('.game-list, .game-list__status').should('exist');
    cy.get('body').should(($body) => {
      const hasGames = $body.find('.game-card').length > 0;
      const hasEmptyState = $body.find('.game-list__status-title').text().includes('No Games Found');

      expect(hasGames || hasEmptyState).to.equal(true);
    });
  });

  it('zeigt bei Suchbegriffen mit mehr als 200 Zeichen einen normalen Zustand', () => {
    const longSearchTerm = 'a'.repeat(201);

    cy.intercept('GET', '/api/games/search*').as('search');
    cy.get('.search-bar__input').type(longSearchTerm);
    cy.get('.search-bar__button').click();

    cy.wait('@search').its('response.statusCode').should('eq', 200);
    cy.get('.game-list, .game-list__status').should('exist');
  });

  it('loest beim Tippen keinen Request aus, sondern erst bei Enter oder Button-Klick', () => {
    cy.intercept('GET', '/api/games/search*').as('search');
    cy.get('.search-bar__input').type('zel');
    cy.get('@search.all').should('have.length', 0);

    cy.get('.search-bar__input').type('{enter}');
    cy.wait('@search').its('response.statusCode').should('eq', 200);
  });
});
