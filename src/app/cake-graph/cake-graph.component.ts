import { Component, effect, OnDestroy, OnInit, signal } from '@angular/core';
import { AgCharts } from "ag-charts-angular";
import { AgChartOptions } from "ag-charts-community";
import { Asset, getData, saveData } from './data';
import { ViewportService } from '../services/viewport.service';
import { Subscription } from 'rxjs';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-cake-graph',
  standalone: true,
  imports: [AgCharts, NgIf, NgFor],
  templateUrl: './cake-graph.component.html',
  styleUrl: './cake-graph.component.scss'
})
export class CakeGraphComponent implements OnInit, OnDestroy {
  options!: AgChartOptions;
  totalSpent!: number;
  salary = signal<number>(this.loadData().find(e => e.asset == 'Salario')?.amount ?? 0);
  pieSize = signal<number>(700);
  top = signal<number>(350);
  fixedPieSize = signal<boolean>(false);
  viewportHeightOffset: number = 200;

  gastoAsset = signal<string>('')
  gastoAmount = signal<number>(0);

  gastos = signal<Asset[]>([]);

  viewportHeight!: number;
  private subscription!: Subscription;

  constructor(private viewportService: ViewportService) {
    effect(()=>{
      this.setPieData();
    })
  }

  updateSalary(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.salary.update(() => Number(inputElement.value));
    this.setPieData();
  }

  updatePieSize(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.top.update(() => Number(inputElement.value) * 0.5);
    this.pieSize.update(() => Number(inputElement.value));
  }

  updateFixedPieSize(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.fixedPieSize.update(() => inputElement.checked);
    if (!inputElement.checked) {
      this.pieSize.update(() => this.viewportHeight - this.viewportHeightOffset);
    }
  }

  setPieData() {
    saveData([
      { asset: 'Salario', amount: this.salary() },
      ...this.gastos().filter(e => e.asset != 'Salario')
    ])
    let data = getData(this.salary(), this.gastos());
    this.totalSpent = data.totalSpent;
    this.options = {
      width: this.pieSize(),
      height: this.pieSize(),
      data: data.chartData,
      title: {
        text: "Pinina's finance",
      },
      series: [
        {
          type: "pie",
          angleKey: "amount",
          calloutLabelKey: "asset",
          sectorLabelKey: "amount",
          sectorLabel: {
            color: "white",
            formatter: ({ value }) => `${(value).toFixed(0)}€`,
          },
        },
      ],
    };
  }

  addGasto() {
    if (!this.gastoAmount() || !this.gastoAsset()) {
      return;
    }
    this.gastos.update((current) => {
      current.push({ amount: this.gastoAmount(), asset: this.gastoAsset() })
      return current;
    })
    this.setPieData();
  }

  removeGasto(index: number) {

    this.gastos.update((current) => {
      current.splice(index, 1);
      return current;
    })
    this.setPieData();
  }

  updateAssetToAdd(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.gastoAsset.update(() => inputElement.value)
  }

  updateAmountToAdd(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.gastoAmount.update(() => Number(inputElement.value))
  }

  loadData() {
    return JSON.parse(localStorage.getItem('cake-nance-data') ?? '[]') as Asset[];
  }

  clearGastos() {
    const baseData = [{ asset: 'Salario', amount: this.salary() }];
    localStorage.setItem('cake-nance-data', JSON.stringify(baseData));

    this.gastos.update(() => {
      let data = this.loadData()
      return data;
    })

    this.setPieData();
  }

  ngOnInit() {
    this.subscription = this.viewportService.viewportHeight$.subscribe(height => {
      this.viewportHeight = height;
      this.pieSize.update(() => height - this.viewportHeightOffset);
    });
    this.setPieData();
    this.gastos.update(() => this.loadData());
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
