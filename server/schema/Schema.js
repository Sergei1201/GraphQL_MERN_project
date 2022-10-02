//const {clients, projects} = require('./sampleData')
const {GraphQLObjectType, GraphQLID, GraphQLString, GraphQLNonNull, GraphQLSchema, GraphQLList, GraphQLInputObjectType, GraphQLEnumType} = require('graphql')
// Bringing Client Schema
const Client = require('../models/Client')
// Bringing Project Schema
const Project = require('../models/Project')

// Creatinng Client Type
const ClientType = new GraphQLObjectType({
    name: "Client",
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        email: {type: GraphQLString},
        phone: {type: GraphQLString}
    })
})

// Creating Project Type
const ProjectType = new GraphQLObjectType({
    name: 'Project',
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        description: {type: GraphQLString},
        status: {type: GraphQLString},
        client: {
            type: ClientType,
            resolve(parent, args) {
                return Client.findById(parent.clientId)
            }
        }

    })
})

// Queries
const RootQuery = new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
        // Getting a single client
        client: {
            type: ClientType,
            args: {
                id: {type: GraphQLNonNull(GraphQLID)}
            },
            resolve(parent, args) {
                return Client.findById(args.id)
            }
        },
        // Getting all clients
        clients: {
            type: GraphQLList(ClientType),
            resolve(parent, args) {
                return Client.find()
            }
        },
        // Getting a single project
        project: {
            type: ProjectType,
            args: {
                id: {type: GraphQLNonNull(GraphQLID)}
            },
            resolve(parent, args) {
                return Project.findById(args.id)
            }
        },
        // Getting all projects
        projects: {
            type: GraphQLList(ProjectType),
            resolve(parent, args) {
                return Project.find()
            }
        }
        
}})

// Mutations
const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        // Add client
        addClient: {
            type: ClientType,
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
                email: {type: GraphQLNonNull(GraphQLString)},
                phone: {type: GraphQLNonNull(GraphQLString)},

            },
            resolve(parent, args) {
                // Creating a new client
                const client = new Client({
                    name: args.name,
                    email: args.email,
                    phone: args.phone
                })
                // Saving the client into the database (MongoDB)
                return client.save()
            }
        },
        // Delete client
        deleteClient: {
            type: ClientType,
            args: {
                id: {type: GraphQLNonNull(GraphQLID)}
            },
            resolve(parent, args) {
                // Deleting a project associated with that particular client if the client is deleted (cascading deleting)
         Project.find({clientId: args.id})
         .then(projects => {
            projects.forEach(project => project.remove())
         })

                // Deleting a client
            return Client.findByIdAndRemove(args.id)
            }
        },
        // Add Project
        addProject: {
            type: ProjectType,
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
                description: {type: GraphQLNonNull(GraphQLString)},
                status: {
                    type: new GraphQLEnumType({
                        name: 'ProjectStatus',
                        values: {
                            "new": {value: "Not Started"},
                            "progress": {value: "In Progress"},
                            "completed": {value: "Completed"}
                        },
                        defaultValue: "Not Started"
                    })
                },
                clientId: {type: GraphQLNonNull(GraphQLID)}
            },
            resolve(parent, args) {
                // Creating a new project
                const project = new Project({
                    name: args.name,
                    description: args.description,
                    status: args.status,
                    clientId: args.clientId
                })
                // Saving the project into the database (MongoDB)
                return project.save()
            }
        },
        // Delete Project
        deleteProject: {
            type: ProjectType,
            args: {
                id: {type: GraphQLNonNull(GraphQLID)}
            },
            resolve(parent, args) {
                return Project.findByIdAndRemove(args.id)
            }
        },
        // Update Project
        updateProject: {
            type: ProjectType,
            args: {
                id: {type: GraphQLNonNull(GraphQLID)},
                name: {type: GraphQLString},
                description: {type: GraphQLString},
                status: {
                    type: new GraphQLEnumType({
                        name: 'ProjectStatusUpdate',
                        values: {
                            "new": {value: "Not Started"},
                            "progress": {value: "In Progress"},
                            "completed": {value: "Completed"}
                        },
                    })
                },
            },
            resolve(parent, args) {
                // Updating the chosen project
               return Project.findByIdAndUpdate(
                args.id,
                {
                    $set: {
                        name: args.name,
                        description: args.description,
                        status: args.status
                    }
                },
                {new: true}
               )
                
                
            }
        },
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
})