export interface Asset {
  asset: string,
  amount: number
}

interface ChartData {
  chartData: Array<Asset>,
  totalSpent: number,
}

export function saveData(data: Array<Asset>) {
  const jsonContent = JSON.stringify(data);
  localStorage.setItem('cake-nance-data', jsonContent);
}

export function getData(salary: number, data: Array<Asset>): ChartData {

  console.log('SALARY', salary)
  let totalSpent = 0;

  function calcSalary(data: Array<Asset>, x: number): Array<Asset> {
    totalSpent = data.reduce((acc, item: Asset) => {
      if (item.asset !== "Salario") {
        return acc + item.amount;
      }
      return acc;
    }, 0);

    data.forEach((item: Asset) => {
      if (item.asset === "Salario") {
        item.amount = x - totalSpent;
      }
    });

    return data;
  }

  let ix = data.findIndex(e => e.asset == 'Salario')
  if (ix > -1) {
    console.log(1)
    data[ix].amount = salary;
  } else {
    console.log(2)
    data.push({ asset: 'Salario', amount: salary });
  }
  return {
    chartData: calcSalary(data, salary),
    totalSpent
  }
}
