const t = require('@babel/types');

/**
 * Check whether the bindingName has default assignment
 * @param bindingPath
 * @param bindingName
 */
function hasDefaultAssignment(bindingPath, bindingName) {
  const id = bindingPath.get('id');
  if (t.isObjectPattern(id)) {
    const properties = id.get('properties');
    for (let property of properties) {
      if (t.isObjectProperty(property) && t.isIdentifier(property.node.key) && property.node.key.name === bindingName && t.isAssignmentPattern(property.node.value)) {
        return true;
      }
    }
  }
  return false;
}
/**
 * Judge whether a variable is derived from props
 * @param scope
 * @param bindingName
 * @param excludeAssignment If the variable has default assignment, then should not identify it
 */
module.exports = function isDerivedFromProps(scope, bindingName, excludeAssignment = false) {
  const binding = scope.getBinding(bindingName);
  if (binding && binding.path.isVariableDeclarator()) {
    if (excludeAssignment) {
      if (hasDefaultAssignment(binding.path, bindingName)) {
        return false;
      }
    }
    const init = binding.path.get('init');
    if (init.isMemberExpression()) { // this.props
      const { object, property } = init.node;
      if (t.isThisExpression(object) && t.isIdentifier(property, { name: 'props' })) {
        return true;
      }
    }
    if (init.isIdentifier()) { // props
      if (init.node.name === 'props') {
        return true;
      }
      return isDerivedFromProps(scope, init.node.name, excludeAssignment);
    }
  }
  return false;
};
