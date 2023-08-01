export function checkLocation (location){
    let isUnreserved =false;
    let isArchived = false;

    if(location=="Office"){
        isUnreserved=true;
    }
    if(location=="Resold"||location=="Disuse"){
        isArchived=true;
    }
    return {isUnreserved,isArchived};
};