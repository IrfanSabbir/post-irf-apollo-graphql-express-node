const {gql} = require('apollo-server-express')

module.exports = gql`

type Query{
    allUser : [UserInfo!]
    singleUser (user_name : String!) : UserInfo
}
`