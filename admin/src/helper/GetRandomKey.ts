const getRandomString = (id: string): string => {
	return `${id} - ${(Math.random() + 1).toString(36).substring(7)}`;
};

export default getRandomString;
