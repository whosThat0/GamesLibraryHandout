/// <reference types="cypress" />

/**
 * E2E-Tests fuer simulierte Server- und Netzwerkfehler.
 */
describe('Fehlerbehandlung', () => {
  const uniqueSuffix = () => Date.now().toString();

  it('zeigt eine Fehlermeldung bei einem Serverfehler beim initialen Laden', () => {
    cy.intercept('GET', '/api/games', {
      statusCode: 500,
      body: { message: 'Simulierter Serverfehler' },
    }).as('getGamesError');

    cy.visit('/');
    cy.wait('@getGamesError');

    cy.get('.home-page__error')
      .should('be.visible')
      .and('contain.text', 'Fehler beim Laden der Spiele.');
  });

  it('zeigt eine Fehlermeldung bei einem Serverfehler waehrend der Suche', () => {
    cy.visitApp();
    cy.intercept('GET', '/api/games/search*', {
      statusCode: 500,
      body: { message: 'Simulierter Suchfehler' },
    }).as('searchError');

    cy.get('.search-bar__input').type('Fehlersuche');
    cy.get('.search-bar__button').click();
    cy.wait('@searchError');

    cy.get('.home-page__error')
      .should('be.visible')
      .and('contain.text', 'Fehler bei der Suche.');
  });

  it('zeigt bei einem Netzwerkfehler beim Erstellen einen Fehler und kein neues Spiel', () => {
    const title = `Cypress Netzwerkfehler ${uniqueSuffix()}`;

    cy.visitApp();
    cy.openAddGameForm();
    cy.fillGameForm({
      title,
      description: 'Darf bei einem Netzwerkfehler nicht erstellt werden.',
      releaseDate: '2020-05-20',
    });

    cy.intercept('POST', '/api/games', { forceNetworkError: true }).as('createNetworkError');
    cy.get('.game-form__btn--submit').click();
    cy.wait('@createNetworkError');

    cy.get('.home-page__error')
      .should('be.visible')
      .and('contain.text', 'Fehler beim Erstellen des Spiels.');
    cy.contains('.game-card__title', title).should('not.exist');

    // Ist-Zustand: Das Formular wird trotz Fehler geschlossen, weil HomePage
    // setShowForm(false) nach dem await unabhaengig vom Ergebnis ausfuehrt.
    cy.get('.game-form').should('not.exist');
  });
});
