// Define the type for each period object
interface Period {
    start: Date;
    end: Date;
}
  
// Function to generate periods based on start and end dates
export const generatePeriodsFromDates = (
    startYear: number,
    startMonth: number,
    endYear: number,
    endMonth: number
  ): Period[] => {
    const periods: Period[] = []; // Specify array type as Period[]
    
    let startDate = new Date(startYear, startMonth - 1, 1, 0, 0); // Month is 0-indexed
    const endDate = new Date(endYear, endMonth - 1, 28, 23, 59); // Adjusted end date
    
    while (startDate <= endDate) {
      const year = startDate.getFullYear();
      const month = startDate.getMonth();
  
      // First period: 7th 00:00 to 13th 23:59
      periods.push({
        start: new Date(year, month, 7, 0, 0),
        end: new Date(year, month, 13, 23, 59),
      });
  
      // Second period: 14th 00:00 to 20th 23:59
      periods.push({
        start: new Date(year, month, 14, 0, 0),
        end: new Date(year, month, 20, 23, 59),
      });
  
      // Third period: 21st 00:00 to 27th 23:59
      periods.push({
        start: new Date(year, month, 21, 0, 0),
        end: new Date(year, month, 27, 23, 59),
      });
  
      // Fourth period: 28th 00:00 to 6th of the next month 23:59
      periods.push({
        start: new Date(year, month, 28, 0, 0),
        end: new Date(year, month + 1, 6, 23, 59),
      });
  
      // Move to the next month
      startDate.setMonth(startDate.getMonth() + 1);
    }
  
    return periods;
};
  
// Example usage
// const customPeriods = generatePeriodsFromDates(2023, 1, 2025, 12);
// console.log(customPeriods);
  