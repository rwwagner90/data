import { computed } from '@ember/object';
import { createStore } from 'dummy/tests/helpers/store';

import { module, test } from 'qunit';

import DS from 'ember-data';

const TestAdapter = DS.Adapter.extend();

module('Debug');

test('_debugInfo groups the attributes and relationships correctly', function(assert) {
  const MaritalStatus = DS.Model.extend({
    name: DS.attr('string'),
  });

  const Post = DS.Model.extend({
    title: DS.attr('string'),
  });

  const User = DS.Model.extend({
    name: DS.attr('string'),
    isDrugAddict: DS.attr('boolean'),
    maritalStatus: DS.belongsTo('marital-status', { async: false }),
    posts: DS.hasMany('post', { async: false }),
  });

  let store = createStore({
    adapter: TestAdapter.extend(),
    maritalStatus: MaritalStatus,
    post: Post,
    user: User,
  });

  let record = store.createRecord('user');

  let propertyInfo = record._debugInfo().propertyInfo;

  assert.equal(propertyInfo.groups.length, 4);
  assert.equal(propertyInfo.groups[0].name, 'Attributes');
  assert.deepEqual(propertyInfo.groups[0].properties, ['id', 'name', 'isDrugAddict']);
  assert.equal(propertyInfo.groups[1].name, 'belongsTo');
  assert.deepEqual(propertyInfo.groups[1].properties, ['maritalStatus']);
  assert.equal(propertyInfo.groups[2].name, 'hasMany');
  assert.deepEqual(propertyInfo.groups[2].properties, ['posts']);
});

test('_debugInfo supports arbitray relationship types', function(assert) {
  const MaritalStatus = DS.Model.extend({
    name: DS.attr('string'),
  });

  const Post = DS.Model.extend({
    title: DS.attr('string'),
  });

  const User = DS.Model.extend({
    name: DS.attr('string'),
    isDrugAddict: DS.attr('boolean'),
    maritalStatus: DS.belongsTo('marital-status', { async: false }),
    posts: computed(() => [1, 2, 3])
      .readOnly()
      .meta({
        options: { inverse: null },
        isRelationship: true,
        kind: 'customRelationship',
        name: 'posts',
        type: 'post',
      }),
  });

  let store = createStore({
    adapter: TestAdapter.extend(),
    maritalStatus: MaritalStatus,
    post: Post,
    user: User,
  });

  let record = store.createRecord('user');

  let propertyInfo = record._debugInfo().propertyInfo;

  assert.deepEqual(propertyInfo, {
    includeOtherProperties: true,
    groups: [
      {
        name: 'Attributes',
        properties: ['id', 'name', 'isDrugAddict'],
        expand: true,
      },
      {
        name: 'belongsTo',
        properties: ['maritalStatus'],
        expand: true,
      },
      {
        name: 'customRelationship',
        properties: ['posts'],
        expand: true,
      },
      {
        name: 'Flags',
        properties: ['isLoaded', 'hasDirtyAttributes', 'isSaving', 'isDeleted', 'isError', 'isNew', 'isValid'],
      },
    ],
    expensiveProperties: ['maritalStatus', 'posts'],
  });
});
