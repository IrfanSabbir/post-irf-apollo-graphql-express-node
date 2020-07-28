const {gql} = require('apollo-server-express')

module.exports = gql`
    type Image {
        url: String
        public_id: String
    }
    type UserInfo {
        _id: ID!
        user_name : String !
        email: String!
        name : String 
        about :String
        images : [Image]
        createdAt : String!
        updatedAt : String!
    }
    type User {
        user :UserInfo !
        token : String!
    }

    input PostUser{
        user_name : String !
        email: String!
        password:String !
        name : String 
        about :String 
    }

    input  postUpdate{
        name:String
        about:String
    }

    input postUpdatePassword {
        oldPass:String!
        newPass:String!
        confirmNewPass:String!
    }

    input PostLogin {
        email : String!
        password : String!
    }

    type Query {
        me: String!
        userInfo : UserInfo!
    }
    type Mutation {
        userCreate ( input : PostUser! ): User!
        userLogIn ( input : PostLogin! ): User!
        updateUser ( input : postUpdate ): UserInfo!
        uppateUserPass ( input : postUpdatePassword! ): UserInfo!

    }
`;