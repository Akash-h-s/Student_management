/// <reference types="cypress" />

Cypress.Commands.add('login', (role, email, password) => {
    cy.visit('/login');

    // Select the role from the dropdown
    cy.get('select').should('be.visible').select(role);

    // Wait for the UI to update the input field based on the role
    // We expect an email input for admin and teacher
    cy.get('input[type="email"]', { timeout: 10000 }).should('be.visible').clear().type(email);

    if (password) {
        cy.get('input[type="password"]').should('be.visible').clear().type(password);
    }

    // Click the sign in button
    cy.contains('button', 'Sign In').should('not.be.disabled').click();
});
