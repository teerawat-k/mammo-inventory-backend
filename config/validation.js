'use strict'

module.exports = {
  attributes: {
    pageNo: 'page no',
    pageSize: 'page size',
  },
  accepted: ':attribute must be accepted',
  after: ':attribute must be after :after',
  after_or_equal: ':attribute must be equal or after :after_or_equal',
  alpha: ':attribute field must contain only alphabetic characters',
  alpha_dash: ':attribute field may only contain alpha-numeric characters, as well as dashes and underscores',
  alpha_num: ':attribute field must be alphanumeric',
  before: ':attribute must be before :before',
  before_or_equal: ':attribute must be equal or before :before_or_equal',
  between: {
    numeric: ':attribute field must be between :min and :max',
    string: ':attribute field must be between :min and :max characters'
  },
  confirmed: ':attribute confirmation does not match',
  email: 'invalid :attribute format',
  date: ':attribute is not a valid date',
  def: ':attribute attribute has errors',
  digits: ':attribute must be :digits digits',
  digits_between: ':attribute field must be between :min and :max digits',
  different: ':attribute and :different must be different',
  in: 'selected :attribute is invalid',
  integer: ':attribute must be an integer',
  hex: ':attribute field should have hexadecimal format',
  min: {
    numeric: ':attribute must be at least :min',
    string: ':attribute must be at least :min characters'
  },
  max: {
    numeric: ':attribute must not exceed :max',
    string: ':attribute must not exceed :max characters'
  },
  not_in: 'selected :attribute is invalid',
  numeric: ':attribute must be a number',
  present: ':attribute field must be present (but can be empty)',
  required: ':attribute is required',
  required_if: ':attribute field is required when :other is :value',
  required_unless: ':attribute field is required when :other is not :value',
  required_with: ':attribute field is required when :field is not empty',
  required_with_all: ':attribute field is required when :fields are not empty',
  required_without: ':attribute field is required when :field is empty',
  required_without_all: ':attribute field is required when :fields are empty',
  same: ':attribute and :same must match',
  size: {
    numeric: ':attribute must be :size',
    string: ':attribute must be :size characters'
  },
  string: ':attribute must be a string',
  url: ':attribute format is invalid (url)',
  regex: ':attribute format is invalid'
}
