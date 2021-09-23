const changeAllMessurementsToNewAliasNameOnDB = async (
	id: string,
	newName: ioBroker.StringOrTranslated,
): Promise<void> => {
	id;
	newName;
};

const deleteAllMessurementsWithAliasNameOnDB = async (
	id: string,
	newName: ioBroker.StringOrTranslated,
): Promise<void> => {
	id;
	newName;
};

const InfluxDBHandlerAdapter = {
	changeAllMessurementsToNewAliasNameOnDB: changeAllMessurementsToNewAliasNameOnDB,
	deleteAllMessurementsWithAliasNameOnDB: deleteAllMessurementsWithAliasNameOnDB,
};

export default InfluxDBHandlerAdapter;
