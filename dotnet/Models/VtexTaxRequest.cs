﻿using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace Taxjar.Models
{
    public class VtexTaxRequest
    {
        [JsonProperty("orderFormId")]
        public string OrderFormId { get; set; }

        [JsonProperty("salesChannel")]
        public string SalesChannel { get; set; }

        [JsonProperty("items")]
        public Item[] Items { get; set; }

        [JsonProperty("totals")]
        public Total[] Totals { get; set; }

        [JsonProperty("clientEmail")]
        public string ClientEmail { get; set; }

        [JsonProperty("shippingDestination")]
        public ShippingDestination ShippingDestination { get; set; }

        [JsonProperty("clientData")]
        public ClientData ClientData { get; set; }

        [JsonProperty("paymentData")]
        public PaymentData PaymentData { get; set; }
    }

    public partial class ClientData
    {
        [JsonProperty("email")]
        public string Email { get; set; }

        [JsonProperty("document")]
        public string Document { get; set; }

        [JsonProperty("corporateDocument")]
        public object CorporateDocument { get; set; }

        [JsonProperty("stateInscription")]
        public object StateInscription { get; set; }
    }

    public partial class Item
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("sku")]
        public string Sku { get; set; }

        [JsonProperty("ean")]
        public string Ean { get; set; }

        [JsonProperty("refId")]
        public object RefId { get; set; }

        [JsonProperty("unitMultiplier")]
        public long UnitMultiplier { get; set; }

        [JsonProperty("measurementUnit")]
        public string MeasurementUnit { get; set; }

        [JsonProperty("targetPrice")]
        public double TargetPrice { get; set; }

        [JsonProperty("itemPrice")]
        public double ItemPrice { get; set; }

        [JsonProperty("quantity")]
        public long Quantity { get; set; }

        [JsonProperty("discountPrice")]
        public long DiscountPrice { get; set; }

        [JsonProperty("dockId")]
        public string DockId { get; set; }

        [JsonProperty("freightPrice")]
        public long FreightPrice { get; set; }

        [JsonProperty("brandId")]
        public string BrandId { get; set; }
    }

    public partial class PaymentData
    {
        [JsonProperty("payments")]
        public Payment[] Payments { get; set; }
    }

    public partial class Payment
    {
        [JsonProperty("paymentSystem")]
        public string PaymentSystem { get; set; }

        [JsonProperty("bin")]
        public object Bin { get; set; }

        [JsonProperty("referenceValue")]
        public long ReferenceValue { get; set; }

        [JsonProperty("value")]
        public long Value { get; set; }

        [JsonProperty("installments")]
        public object Installments { get; set; }
    }

    public partial class ShippingDestination
    {
        [JsonProperty("country")]
        public string Country { get; set; }

        [JsonProperty("state")]
        public string State { get; set; }

        [JsonProperty("city")]
        public string City { get; set; }

        [JsonProperty("neighborhood")]
        public string Neighborhood { get; set; }

        [JsonProperty("postalCode")]
        public string PostalCode { get; set; }

        [JsonProperty("street")]
        public string Street { get; set; }
    }

    public partial class Total
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("value")]
        public long Value { get; set; }
    }
}
