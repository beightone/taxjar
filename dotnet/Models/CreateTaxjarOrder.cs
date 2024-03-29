﻿using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace Taxjar.Models
{
    public class CreateTaxjarOrder : Order
    {
        //[JsonProperty("transaction_id")]
        //public string TransactionId { get; set; }

        [JsonProperty("user_id")]
        public int UserId { get; set; }

        //[JsonProperty("transaction_date")]
        //public string TransactionDate { get; set; }

        //[JsonProperty("provider")]
        //public string Provider { get; set; }

        [JsonProperty("plugin")]
        public string PlugIn { get; set; }

        [JsonProperty("transaction_reference_id", NullValueHandling = NullValueHandling.Ignore)]
        public string TransactionReferenceId { get; set; }
    }
}
