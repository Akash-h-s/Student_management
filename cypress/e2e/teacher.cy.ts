describe('Teacher Role Flows', () => {
    const teacherEmail = 'teacher@example.com';
    const teacherPassword = 'teacher';

    beforeEach(() => {
        // Intercept the login call
        cy.intercept('POST', '**/hasura/login', {
            statusCode: 200,
            body: {
                success: true,
                token: 'mock-teacher-token-456',
                user: {
                    id: 2,
                    name: 'Teacher User',
                    email: teacherEmail,
                    role: 'teacher'
                }
            }
        }).as('teacherLogin');

        // General GraphQL Interceptor for fallback
        cy.intercept('POST', '**/v1/graphql', (req) => {
            // Default fallback
        }).as('graphql');
    });

    it('should successfully login as teacher', () => {
        cy.login('teacher', teacherEmail, teacherPassword);
        cy.wait('@teacherLogin');
        cy.url().should('include', '/teacher/dashboard');
    });

    it('should allow marks entry workflow', () => {
        cy.login('teacher', teacherEmail, teacherPassword);
        cy.wait('@teacherLogin');
        cy.visit('/teacher/marks-entry');

        // Mock Subject Fetch
        cy.intercept('POST', '**/v1/graphql', (req) => {
            if (req.body.operationName === 'GetAllSubjects') {
                req.reply({
                    data: {
                        subjects: [
                            { id: 1, name: 'mathematics' },
                            { id: 2, name: 'science' }
                        ]
                    }
                });
            } else if (req.body.operationName === 'GetStudentsByClassSection') {
                req.reply({
                    data: {
                        class_sections: [{
                            students: [
                                { id: 101, admission_no: 'A001', name: 'John Doe' },
                                { id: 102, admission_no: 'A002', name: 'Jane Smith' }
                            ]
                        }]
                    }
                });
            } else if (req.body.operationName === 'GetOrCreateSubject' || req.body.operationName === 'GetOrCreateExam') {
                req.reply({
                    data: {
                        insert_subjects_one: { id: 1 },
                        insert_exams_one: { id: 1 }
                    }
                });
            } else if (req.body.operationName === 'CheckExistingMarks') {
                req.reply({ data: { marks: [] } });
            } else if (req.body.operationName === 'InsertMarks') {
                req.reply({
                    data: {
                        insert_marks: { affected_rows: 2 }
                    }
                });
            }
        }).as('gqlMarksOperations');

        // 1. Enter Class details
        cy.contains('label', 'Class').next('input').type('10');
        cy.contains('label', 'Section').next('input').type('A');

        // 2. Select Subject
        // Wait for initial subject load if any, or just type/select
        // Since we mock GetAllSubjects, it might populate if logic runs on mount/change
        cy.get('select').eq(0).select('mathematics'); // Assuming first select is subject (based on UI order: class(input), section(input), subject(select))
        // Actually looking at code: SubjectSelectWithNew is likely the first 'select' element 
        // UI Grid: Class(Input), Section(Input), Subject(Select+New), Test Type(Select), Year(Input)
        // So 1st select is Subject. 2nd select is Test Type.

        // 3. Select Test Type
        cy.get('select').eq(1).select('FA1');

        // 4. Click Fetch Students
        cy.contains('button', 'Fetch Students').click();

        // 5. Verify Students Loaded
        cy.contains('John Doe').should('be.visible');
        cy.contains('Jane Smith').should('be.visible');

        // 6. Enter Marks
        // Using index or locating by row
        // First student marks
        cy.get('tbody tr').first().find('input[type="number"]').type('85');
        // First student remarks
        cy.get('tbody tr').first().find('input[type="text"]').type('Good job');

        // Second student marks
        cy.get('tbody tr').eq(1).find('input[type="number"]').type('92');

        // 7. Click Save
        cy.contains('button', 'Save Marks').click();

        // 8. Verify Success
        cy.contains('Marks saved successfully').should('be.visible');
    });

    it('should allow group creation', () => {
        cy.login('teacher', teacherEmail, teacherPassword);
        cy.wait('@teacherLogin');
        cy.visit('/teacher/chat');

        // Mock Chat Subscriptions/Queries
        cy.intercept('POST', '**/v1/graphql', (req) => {
            if (req.body.operationName === 'SearchParents' || req.body.operationName === 'GetAllParents') {
                req.reply({
                    data: {
                        parents: [
                            { id: 3, name: 'Parent One', email: 'p1@test.com', students: [{ name: 'Kid 1' }] },
                            { id: 4, name: 'Parent Two', email: 'p2@test.com', students: [{ name: 'Kid 2' }] }
                        ]
                    }
                });
            } else if (req.body.operationName === 'CheckExistingChat') {
                req.reply({
                    data: {
                        chats: []
                    }
                });
            } else if (req.body.operationName === 'CreateChat') {
                req.reply({
                    data: {
                        insert_chats_one: { id: 99 }
                    }
                });
            } else if (req.body.operationName === 'AddChatParticipants') {
                req.reply({
                    data: {
                        insert_chat_participants: { affected_rows: 2 }
                    }
                });
            }
        }).as('gqlGroupOperations');

        // --- Create Group Flow ---
        cy.contains('button', 'New Group').click();
        cy.get('input[placeholder*="Group name"]').should('be.visible').type('Math Study Group');
        cy.contains('button', 'Create Group').should('be.disabled'); // Initial check

        // Select Parents
        cy.contains('Parent One').click();
        cy.contains('Parent Two').click();

        cy.contains('button', 'Create Group').should('not.be.disabled').click();

        cy.on('window:alert', (str) => {
            expect(str).to.equal('Group created successfully!');
        });
    });

    it('should allow sending a message', () => {
        cy.login('teacher', teacherEmail, teacherPassword);
        cy.wait('@teacherLogin');
        cy.visit('/teacher/chat');

        // Mock setup (Repeated for isolation)
        cy.intercept('POST', '**/v1/graphql', (req) => {
            if (req.body.operationName === 'SearchParents') {
                req.reply({
                    data: {
                        parents: [
                            { id: 3, name: 'Parent One', email: 'p1@test.com', students: [{ name: 'Kid 1' }] }
                        ]
                    }
                });
            } else if (req.body.operationName === 'CheckExistingChat') {
                req.reply({ data: { chats: [] } });
            } else if (req.body.operationName === 'CreateChat') {
                req.reply({ data: { insert_chats_one: { id: 100 } } });
            } else if (req.body.operationName === 'AddChatParticipants') {
                req.reply({ data: { insert_chat_participants: { affected_rows: 2 } } });
            } else if (req.body.operationName === 'SendMessage') {
                req.reply({ data: { insert_messages_one: { id: 500 } } });
            }
        }).as('gqlMessageOperations');

        // --- Send Message Flow ---
        cy.contains('button', 'New Chat').click();
        cy.get('input[placeholder*="Search parents"]').type('Parent One');
        cy.contains('Parent One').click();

        cy.get('textarea[placeholder="Type a message..."]').type('Hello Mr. Parent');
        cy.get('textarea[placeholder="Type a message..."]').parent().find('button').click();
    });
});
