---
title: EBRI DBN
description: Building proof of concept &ndash; EBRI's Digital Business Network
---


Second time using this project as  a [demonstrator](../ebri_dashboard.html) in the last few months, so I'm finally getting around to documenting the story behind it. I spent a month as a visiting researcher with the [___Operations and Information Management___](https://www2.aston.ac.uk/aston-business-school/research/departments/oim) group at Aston Business School in 2018. During that period I worked with my host, [Victoria Uten](https://research.aston.ac.uk/en/persons/victoria-uren) on a project with [EBRI](https://bioenergy-for-business.org) (what used to be the European Bioenergy Research Institute) &ndash; to model a digital business network (DBN) from which EBRI could provide information and services to local companies within the ___Energy from Waste (EfW)___ sector. 

## The Problem
 
__EfW__ involves fairly complex value chains, with a variety of organisations feeding into or deriving value from the sector. Our task was to model this environment, to help businesses identify:
  * partners with shared business strategy or objectives 
  * companies to whom they could provide services 
  * companies providing services they require.
  
Within this model standard and alternative KPIs would be used to track value created by or delivered to an organisation. KPIs would therefore also serve as a means to identify shared values between organisations.

### Benefits for EBRI

The hub of the local EfW community, EBRI pushes information on services and the local economy to its network. A model that describes the sector and provides a common language that ensures better understanding of individual and shared value within the network. This would allow EBRI to more effecively customise service delivery to target organisations. 


### Benefits for Organisations within the Sector

All organisations within the DBN benefit from access to a central point from which to locate information and services. SMEs especially stand to gain; startup costs within the EfW sector are relatively high, making it more difficult for especially plants to set up, and for SMES in general to operate competitively. Identification of partners with shared strategy and values helps smaller companies to build economies of scale, lower costs and increase competitiveness. 


## Sample Use Cases

### Location, Transport & Logistics

### Acquiring & Consuming Feedstock

### Alternative KPIs for Value


## Vision Demonstrator

A ___vision demonstrator___ provides a medium-fidelity, visualisation-based prototype to demonstrate ___proof of concept___. Hosting this online allowed me to continue to collaborate with EBRI and Aston Business School beyond the month I worked on site. Because we were still iterating between requirements analysis and design interactivity was key to exploring different relationships within the network, and how these changed based on which KPI(s) we were defining and/or assessing. 

Multiple options exist for creating an interactive website; the decision on what fits a specific case is based on curent skills, time, access to a specific technology (yourself and your client), data and task complexity, among others. JavaScript is convenient for quick prototyping client-side; to read in the data ([sample dummy data](../twothreethree/dashboard/data/ebri/dummy_network.json)) we were working with I made use of PHP. I chose D3 because it allowed me to reuse and continue to learn to use it for visual data exploration.
