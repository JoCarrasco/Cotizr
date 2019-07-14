import { Component, OnInit } from '@angular/core';
import { AppStorage, StorageKey } from 'src/app/shared';
import { ApiService, ActionService } from 'src/app/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  offlineMode = false;
  e
  constructor(private api: ApiService, private action: ActionService) {
    if (AppStorage.has(StorageKey.OfflineModeSettings)) {
      this.offlineMode = AppStorage.get(StorageKey.OfflineModeSettings);
    }
  }

  ngOnInit() {
  }

  async handleOfflineMode() {
    AppStorage.set(StorageKey.OfflineModeSettings, this.offlineMode);
    if (this.offlineMode === true) {
      this.action.load('Descargando Productos');
      const productsQuantity = (await this.api.getProducts(1)).total;
      const products = (await this.api.getProducts(productsQuantity)).products;
      if (products) {
        AppStorage.set(StorageKey.OfflineProducts, products);
        this.action.stop();
      } else {
        this.action.error('No se pudo descargar la lista de productos', 555);
      }
    }
  }
}
