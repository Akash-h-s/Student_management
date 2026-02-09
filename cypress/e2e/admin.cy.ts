describe('Admin Role Flows', () => {
    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin';

    beforeEach(() => {
        // Intercept the login call to Mock the backend response
        cy.intercept('POST', '**/hasura/login', {
            statusCode: 200,
            body: {
                success: true,
                token: 'mock-admin-token-123',
                user: {
                    id: 1,
                    name: 'Admin User',
                    email: adminEmail,
                    role: 'admin'
                }
            }
        }).as('adminLogin');
    });

    it('should successfully login as admin', () => {
        cy.login('admin', adminEmail, adminPassword);

        // Wait for the API call to resolve
        cy.wait('@adminLogin');

        // Verify redirection to dashboard
        cy.url().should('include', '/admin/dashboard');

        // Verify dashboard content matches Admin expectations
        // Note: Adjust the selector if your dashboard has a specific ID or Class
        // Example: cy.get('[data-testid="admin-dashboard"]').should('be.visible');
        cy.contains('Admin Dashboard', { matchCase: false }).should('exist');
    });

    it('should handle file upload workflow', () => {
        cy.login('admin', adminEmail, adminPassword);
        cy.wait('@adminLogin');
        cy.visit('/admin/upload');

        // Mock the file upload endpoint
        cy.intercept('POST', '**/upload', {
            statusCode: 200,
            body: {
                workflowId: 'test-workflow-123',
                message: 'Workflow started'
            }
        }).as('uploadFile');

        // Mock workflow status polling
        let pollCount = 0;
        cy.intercept('POST', '**/workflow-status', (req) => {
            pollCount++;
            if (pollCount < 3) {
                req.reply({
                    statusCode: 200,
                    body: {
                        workflowId: 'test-workflow-123',
                        status: 'running',
                        progress: pollCount * 30,
                        currentStep: 'Processing data...'
                    }
                });
            } else {
                req.reply({
                    statusCode: 200,
                    body: {
                        workflowId: 'test-workflow-123',
                        status: 'completed',
                        progress: 100,
                        currentStep: 'Finalizing',
                        recordsProcessed: 50
                    }
                });
            }
        }).as('checkStatus');

        // Select Upload Type
        cy.get('select').select('student');

        // Fill Student Specific Fields
        cy.get('input[placeholder*="Class"]').type('10');
        cy.get('input[placeholder*="Section"]').type('A');

        // Upload File
        // Create a dummy file
        const fileName = 'test-students.xlsx';
        cy.get('input[type="file"]').selectFile({
            contents: Cypress.Buffer.from('dummy content'),
            fileName,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        // Verify file is selected
        cy.contains(fileName).should('be.visible');

        // Click Start Upload
        cy.contains('button', 'Start Upload').click();

        cy.wait('@uploadFile');

        // Should show progress
        cy.contains('Processing Workflow').should('be.visible');

        // Wait for polling to complete and show success
        cy.contains('Upload Successful', { timeout: 10000 }).should('be.visible');
        cy.contains('Successfully processed 50 records').should('be.visible');
    });

    it('should allow navigation to Upload page', () => {
        // Perform login
        cy.login('admin', adminEmail, adminPassword);
        cy.wait('@adminLogin');

        // Verify initial state
        cy.url().should('include', '/admin/dashboard');

        // Force visit upload page to test access (or click a link if one exists)
        cy.visit('/admin/upload'); // Simulating navigation
        cy.url().should('include', '/admin/upload');

        // Verify some element on the upload page
        // cy.contains('h1', 'Upload').should('be.visible');
    });
});
