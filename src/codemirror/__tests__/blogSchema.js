/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLFloat,
  GraphQLString,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
} from 'graphql';

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

var TestType = new GraphQLObjectType({
  name: 'Test',
  fields: () => ({
    test: {
      type: TestType,
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

// Blog Schema
var BlogContext = new GraphQLEnumType({
  name: 'Context',
  values: {
    DESKTOP: { description: 'Showing this blog on a desktop browser.' },
    MOBILE: { description: 'Showing this blog on a mobile device.' },
    RSS: { description: 'Populating an RSS feed.' },
  }
});

var BlogImage = new GraphQLObjectType({
  name: 'Image',
  fields: {
    url: { type: GraphQLString },
    width: { type: GraphQLInt },
    height: { type: GraphQLInt },
  }
});

var BlogAuthor = new GraphQLObjectType({
  name: 'Author',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    pic: {
      args: { width: { type: GraphQLInt }, height: { type: GraphQLInt } },
      type: BlogImage
    },
    recentArticle: { type: BlogArticle }
  })
});

var BlogArticle = new GraphQLObjectType({
  name: 'Article',
  fields: {
    id: { type: GraphQLID },
    isPublished: { type: GraphQLBoolean },
    author: { type: BlogAuthor },
    title: { type: GraphQLString },
    body: { type: GraphQLString }
  }
});

export const BlogQuery = new GraphQLObjectType({
  name: 'Query',
  fields: {
    test: {
      type: TestType,
      resolve: () => ({}),
      description: 'Test field'
    },
    article: {
      type: BlogArticle,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: (_, { id }) => article(id),
      description: 'Blog article'
    },
    feed: {
      type: new GraphQLList(BlogArticle),
      description: 'A feed of blog articles',
      args: {
        context: {
          type: BlogContext,
          description: 'The context this feed will be shown in.'
        }
      },
      resolve: () => [
        article(1),
        article(2),
        article(3),
        article(4),
        article(5),
        article(6),
        article(7),
        article(8),
        article(9),
        article(10)
      ]
    }
  }
});

export const BlogSchema = new GraphQLSchema({
  query: BlogQuery,
  description: 'Blog Schema Description'
});

function article(id) {
  return {
    id,
    isPublished: 'true',
    author: johnSmith,
    title: 'My Article ' + id,
    body: 'This is a post',
    hidden: 'This data is not exposed in the schema'
  };
}

var johnSmith = {
  id: 123,
  name: 'John Smith',
  pic: (self, args) => getPic(123, args.width, args.height),
  recentArticle: article(1)
};

function getPic(uid, width, height) {
  return {
    url: `cdn://${uid}`,
    width: `${width}`,
    height: `${height}`
  };
}
