
//  "2023. 8. 2.-2023. 8. 2./Office/Remark1", -> object
export function parseToObjectList(stringList) {
  const objectList = [];
  for (let index = 0; index < stringList.length; index +=1 ) {
      const splitedStr = stringList[index].split('\\');
      const rowId = index;
      const startDate = splitedStr[0] ? convertDateString(splitedStr[0]) : null;
      const endDate = splitedStr[1] ? convertDateString(splitedStr[1]) : null;
      const historyLocation = splitedStr[2] ? splitedStr[2] : null;
      const historyRemark = splitedStr[3] ? splitedStr[3] : '';
  
        const parsedObject = {
          //rowId,
          startDate,
          endDate,
          historyLocation,
          historyRemark,
        };
  
        objectList.push(parsedObject);
      }
    return objectList;
  }
  
 export function convertDateString(dateString) {
    const parts = dateString.split('/');
    if(parts[1]){
    const month = parts[0];
    const day = parts[1];
    const year = parts[2];
  
    return `${year}-${month}-${day}`;}
    else return '';
  }
  
  
  //object -> "2023. 8. 2./2023. 8. 2./Office/Lost"
 export function parseToStringList(objList) {
    return objList.map((obj) => {
      const { startDate, endDate, historyLocation, historyRemark } = obj;
      const startDateString = startDate? new Date(startDate).toLocaleDateString()+'\\': '\\';
      const endDateString = endDate ? new Date(endDate).toLocaleDateString()+'\\' : '\\';
      const locationString = historyLocation ? `${historyLocation}\\` : '\\';
      const remarkString = historyRemark ? `${historyRemark}` : '';
  
      return `${startDateString}${endDateString}${locationString}${remarkString}`;
    });
  }
  