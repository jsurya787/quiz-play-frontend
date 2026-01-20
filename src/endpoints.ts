export const  endpoints = {
    auth: {
        login: '/auth/login',
        loginWithGoogle: '/auth/google', 
        signup: '/auth/signup'
    },
    student: {
        dashboard: '/student/dashboard'
    },
    subjects:{
        list: '/subjects',
        create: '/subjects',
        update: '/subjects',  //:subjectId + requestBody
        delete: '/subjects' //:subjectId
    },
    quiz: {
        list: '/quizzes',
        create: '/quizzes',
        addQuestion: '/quizzes',  //:quizId + questions
        deleteQuestion: '/quizzes', //:quizId + questions + questionId
        publishQuiz: '/quizzes', //:quizId + publish
    }
}