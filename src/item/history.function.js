
//  "2023. 8. 2.-2023. 8. 2./Office/Remark1", -> object  
export function parseToObjectList(stringList) {
    const objectList = [];
  
    for (let index = 0; index < stringList.length; index++) {
      const splitedStr= stringList[index].split('/');
      const rowId = index;
      const startDate =splitedStr[0]? convertDateString(splitedStr[0]):null;
      const endDate = splitedStr[1]? convertDateString(splitedStr[0]): null;
      const historyLocation =splitedStr[2]? splitedStr[2]: null;
      const historyRemark = splitedStr[3]? splitedStr[3]: "";
  
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
    const parts = dateString.split('.').map(part => part.trim());
    const year = parts[0];
    const month = parts[1].padStart(2, '0');
    const day = parts[2].padStart(2, '0');
  
    return `${year}-${month}-${day}`;
  }
  
  
  //object -> "2023. 8. 2./2023. 8. 2./Office/Lost"
 export function parseToStringList(objList) {
    return objList.map((obj) => {
      const { startDate, endDate, historyLocation, historyRemark } = obj;
      const startDateString = startDate? new Date(startDate).toLocaleDateString()+'/': '/';
      const endDateString = endDate ? new Date(endDate).toLocaleDateString()+'/' : '/';
      const locationString = historyLocation ? `${historyLocation}/` : '/';
      const remarkString = historyRemark ? `${historyRemark}` : '';
  
      return `${startDateString}${endDateString}${locationString}${remarkString}`;
    });
  }
  