
#  VM Instances Project

This project demonstrates how to **create, manage, and automate virtual machine (VM) instances**, primarily on **Google Cloud Compute Engine**.  
It contains scripts, examples, and automation tools to manage VM lifecycle efficiently.

---

##  Overview

VMs provide isolated compute environments with configurable CPU, RAM, storage, and networking. This project helps you:

- Provision VM instances with custom configurations  
- Connect and manage VMs  
- Automate VM lifecycle tasks (start, stop, delete)  
- Monitor and log VM metrics

---

---

##  Technologies Used

| Technology | Purpose |
|------------|---------|
| **Google Cloud Compute Engine** | Hosting and managing VMs |
| **gcloud CLI** | Provision and control VMs from terminal |
| **Terraform (optional)** | Infrastructure-as-code for reproducible setups |
| **Bash / Python scripts** | Automation and orchestration |
| **SSH / Metadata scripts** | Managing VM access & configuration |

---

##  Getting Started

### Prerequisites

1. Google Cloud account  
2. `gcloud` CLI installed & authenticated:

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
(Optional) Terraform:

brew install terraform   # macOS
sudo apt install terraform  # Linux
Create a VM Instance
Example using gcloud CLI:

gcloud compute instances create my-vm \
    --zone=us-central1-a \
    --machine-type=n1-standard-1 \
    --image-family=debian-11 \
    --image-project=debian-cloud
Check instance details:

gcloud compute instances describe my-vm --zone=us-central1-a
VM Metadata
Use metadata for configuration or secrets:

gcloud compute instances add-metadata my-vm \
    --metadata key1=value1,key2=value2 \
    --zone=us-central1-a
Retrieve metadata:

gcloud compute instances describe my-vm --zone=us-central1-a
