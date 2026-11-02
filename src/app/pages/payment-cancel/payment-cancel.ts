import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-cancel.html',
  styleUrl: './payment-cancel.css',
})
export class PaymentCancelComponent implements OnInit {
  private route = inject(ActivatedRoute);

  orderNumber = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.orderNumber = params['order_number'] || '';
    });
  }
}
