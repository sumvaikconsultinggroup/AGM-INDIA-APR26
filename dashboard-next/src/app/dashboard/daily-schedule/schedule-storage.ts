// Static data for demonstration
const staticScheduleData = [

];

export function seedIfEmpty() {
  // No need to seed as we're using static data
  console.log('Using static schedule data');
}

export function getAllItems() {
  return [...staticScheduleData];
}

export function getAllDatesWithItems() {
  const dates = new Set();
  staticScheduleData.forEach(item => {
    dates.add(item.date);
  });
  return dates;
}

export function listByDate(dateKey) {
  return staticScheduleData
    .filter(item => item.date === dateKey)
    .sort((a, b) => a.time.localeCompare(b.time));
}

export function addItem(newItem) {
  const id = (staticScheduleData.length + 1).toString();
  const item = {
    id,
    isHidden: false,
    ...newItem,
  };
  staticScheduleData.push(item);
  return item;
}

export function updateItem(dateKey, itemId, updates) {
  const index = staticScheduleData.findIndex(item => item.id === itemId);
  if (index !== -1) {
    staticScheduleData[index] = {
      ...staticScheduleData[index],
      ...updates,
    };
    return staticScheduleData[index];
  }
  return null;
}

export function deleteItem(dateKey, itemId) {
  const index = staticScheduleData.findIndex(item => item.id === itemId);
  if (index !== -1) {
    const deleted = staticScheduleData.splice(index, 1)[0];
    return deleted;
  }
  return null;
}

export function getItem(dateKey, itemId) {
  return staticScheduleData.find(item => item.id === itemId && item.date === dateKey);
}