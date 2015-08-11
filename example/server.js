/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */
import express from 'express';
import graphqlHTTP from 'express-graphql';
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLUnionType,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLFloat,
  GraphQLString,
  GraphQLID,
  GraphQLList,
} from 'graphql';

var app = express();
app.use(express.static(__dirname));
app.use('/graphql', graphqlHTTP(() => ({
  schema: TestSchema
})));
app.listen(8080);
console.log('Started on http://localhost:8080/');

// Schema defined here


// Test Schema

var TestEnum = new GraphQLEnumType({
  name: 'TestEnum',
  values: {
    RED: {},
    GREEN: {},
    BLUE: {},
  }
});

var TestInputObject = new GraphQLInputObjectType({
  name: 'TestInput',
  fields: () => ({
    string: { type: GraphQLString },
    int: { type: GraphQLInt },
    float: { type: GraphQLFloat },
    boolean: { type: GraphQLBoolean },
    id: { type: GraphQLID },
    enum: { type: TestEnum },
    object: { type: TestInputObject },
    // List
    listString: { type: new GraphQLList(GraphQLString) },
    listInt: { type: new GraphQLList(GraphQLInt) },
    listFloat: { type: new GraphQLList(GraphQLFloat) },
    listBoolean: { type: new GraphQLList(GraphQLBoolean) },
    listID: { type: new GraphQLList(GraphQLID) },
    listEnum: { type: new GraphQLList(TestEnum) },
    listObject: { type: new GraphQLList(TestInputObject) },
  })
});

var UnionFirst = new GraphQLObjectType({
  name: 'First',
  fields: () => ({
    first: {
      type: TestType,
      resolve: () => ({})
    }
  })
});

var UnionSecond = new GraphQLObjectType({
  name: 'Second',
  fields: () => ({
    second: {
      type: TestType,
      resolve: () => ({})
    }
  })
});

var TestUnion = new GraphQLUnionType({
  name: 'TestUnion',
  types: [ UnionFirst, UnionSecond ],
  resolveType() {
    return UnionFirst;
  }
});

var TestType = new GraphQLObjectType({
  name: 'Test',
  fields: () => ({
    test: {
      type: TestType,
      resolve: () => ({})
    },
    union: {
      type: TestUnion,
      resolve: () => ({})
    },
    hasArgs: {
      type: GraphQLString,
      resolve(value, args) {
        return JSON.stringify(args);
      },
      args: {
        string: { type: GraphQLString },
        int: { type: GraphQLInt },
        float: { type: GraphQLFloat },
        boolean: { type: GraphQLBoolean },
        id: { type: GraphQLID },
        enum: { type: TestEnum },
        object: { type: TestInputObject },
        // List
        listString: { type: new GraphQLList(GraphQLString) },
        listInt: { type: new GraphQLList(GraphQLInt) },
        listFloat: { type: new GraphQLList(GraphQLFloat) },
        listBoolean: { type: new GraphQLList(GraphQLBoolean) },
        listID: { type: new GraphQLList(GraphQLID) },
        listEnum: { type: new GraphQLList(TestEnum) },
        listObject: { type: new GraphQLList(TestInputObject) },
      }
    },
  })
});

const TestSchema = new GraphQLSchema({
  query: TestType
});
