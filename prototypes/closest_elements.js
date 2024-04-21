function closest( elements, toElement ){
  var closestDistance=Infinity, closestElement;
  for (var i=elements.length;i--;){
    var fromElement = elements[i];
    if (fromElement==toElement) continue;
    var distance = distanceBetween(toElement,fromElement);
    if (distance<closestDistance){
      closestElement  = fromElement;
      closestDistance = distance;
    }
  }
  return closestElement;
}