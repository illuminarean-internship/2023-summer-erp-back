LOCATION=/home/ubuntu/
PROJECT=2023-internship-back
FULL_LOCATION=$LOCATION$PROJECT
sudo rm -rf $FULL_LOCATION\_*
sudo mv /tmp/build $FULL_LOCATION-new
sudo chown -R ubuntu:ubuntu $FULL_LOCATION-new
sudo mv $FULL_LOCATION $FULL_LOCATION\_$(date +"%Y%m%d%H%M")
sudo mv $FULL_LOCATION-new $FULL_LOCATION
cd $FULL_LOCATION

sudo pm2 list | grep $PROJECT
sudo npm install
PM2_LIST_RESULT=$?
echo "PM2_LIST_RESULT diff a b result :  ${PM2_LIST_RESULT}"
if [ ${PM2_LIST_RESULT} -eq "0" ]
then
	sudo pm2 reload index.js --name "2023-internship-back"
else
	sudo pm2 start index.js --name "2023-internship-back"
	sudo pm2 save
fi
