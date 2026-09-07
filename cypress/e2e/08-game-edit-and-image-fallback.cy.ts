/// <reference types="cypress" />

/**
 * E2E-Tests fuer Abbrechen im Edit-Modus und Bild-Fallbacks.
 */
describe('Bearbeiten abbrechen und Bild-Fallbacks', () => {
  const uniqueSuffix = () => Date.now().toString();

  beforeEach(() => {
    cy.visitApp();
  });

  it('stellt beim Abbrechen des Edit-Modus die Originaldaten wieder her', () => {
    const suffix = uniqueSuffix();
    const originalTitle = `Cypress Original ${suffix}`;
    const originalDescription = `Originalbeschreibung ${suffix}`;
    const changedTitle = `Cypress Geaendert ${suffix}`;
    const changedDescription = `Geaenderte Beschreibung ${suffix}`;

    cy.openAddGameForm();
    cy.fillGameForm({
      title: originalTitle,
      description: originalDescription,
      releaseDate: '2020-05-20',
    });
    cy.intercept('POST', '/api/games').as('createGame');
    cy.get('.game-form__btn--submit').click();
    cy.wait('@createGame');

    cy.contains('.game-card', originalTitle).within(() => {
      cy.get('.game-card__btn--edit').click();
    });
    cy.fillGameForm({
      title: changedTitle,
      description: changedDescription,
    });
    cy.get('.game-form__btn--cancel').click();

    cy.get('.game-form').should('not.exist');
    cy.contains('.game-card', originalTitle).within(() => {
      cy.get('.game-card__title').should('have.text', originalTitle);
      cy.get('.game-card__description').should('have.text', originalDescription);
    });
    cy.contains('.game-card__title', changedTitle).should('not.exist');

    cy.deleteGameByTitle(originalTitle);
  });

  it('zeigt nach einer kaputten Bild-URL No Image ohne img-Element', () => {
    const title = `Cypress Kaputtes Bild ${uniqueSuffix()}`;

    cy.openAddGameForm();
    cy.fillGameForm({
      title,
      imageUrl: 'https://invalid.example.invalid/image-does-not-exist.jpg',
      releaseDate: '2020-05-20',
    });
    cy.intercept('POST', '/api/games').as('createGame');
    cy.get('.game-form__btn--submit').click();
    cy.wait('@createGame');

    cy.contains('.game-card', title).within(() => {
      cy.get('.game-card__image').should('exist').trigger('error');
      cy.get('.game-card__no-image').should('contain.text', 'No Image');
      cy.get('.game-card__image').should('not.exist');
    });

    cy.deleteGameByTitle(title);
  });

  it('zeigt bei fehlender Bild-URL No Image ohne img-Element', () => {
    const title = `Cypress Kein Bild ${uniqueSuffix()}`;

    cy.openAddGameForm();
    cy.fillGameForm({
      title,
      releaseDate: '2020-05-20',
    });
    cy.intercept('POST', '/api/games').as('createGame');
    cy.get('.game-form__btn--submit').click();
    cy.wait('@createGame');

    cy.contains('.game-card', title).within(() => {
      cy.get('.game-card__no-image').should('contain.text', 'No Image');
      cy.get('.game-card__image').should('not.exist');
    });

    cy.deleteGameByTitle(title);
  });
});
