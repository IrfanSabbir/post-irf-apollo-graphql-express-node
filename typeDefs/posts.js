const {gql} = require('apollo-server-express')

module.exports = gql `
    type Post{
        _id:ID!
        content:String!
        image:Image,
        created_by:ID!
        creator:String
        craeted_at:String!
        updated_at:String
        view:Int
        like:Int
    }
    type IDS{
        post_id : ID!
    }
    
    input InputImage{
        url:String
        public_id: String
    }

    input PostInput{
        content : String!
        image : InputImage
    }

    input UpdatePost {
        _id :ID!
        fields: PostInput
    }

    type Query{
        allPosts( page:Int!, search:String): [Post!]
        userPost(user_name : String!): [Post!]
        newPost: [Post!]
        authUserPost :  [Post!]
        countPost : Int!
    }
    type Mutation{
        createPost( input: PostInput!): Post!
        deletePost( post_id : ID!) : IDS
        updatePost( input : UpdatePost) : Post!
    }
     type Subscription {
        postAdded : Post!
        postUpdated : Post!
        postDeleted : IDS!
     }
`