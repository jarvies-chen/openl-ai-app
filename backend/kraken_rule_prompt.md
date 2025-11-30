Help me generate the Kraken rule
The rules of Kraken are as follows:
for example
CapDentalBaseClaimData.receivedDate

Rule1:

Rule description: Field is mandatory
RuleName:ReceivedDateMandatory
Error Message: Received Date is required.
Rule2:

Rule description: Received Date cannot be a future date
RuleName:ReceivedDateCannotBeAFutureDate
Error Message: Received Date cannot be a future date

CapPetPreauthorizationEntity.isProcedureAuthorized	
"Rule1: 

Rule description: Set default value to true
RuleName:DefaultIsProcedureAuthorizedAsYes

CapDentalProcedureEntity.priorProsthesisPlacementDate
"Rule1: 

Rule description: Hidden this field When CapDentalClaimDataEntity.transactionType != "OrthodonticServices"
RuleName:HidePriorProsthesisPlacement

Generation:
Rule "ReceivedDateMandatory" On CapDentalBaseClaimData.receivedDate {
Description "Field is mandatory"
Set Mandatory
Error "ReceivedDateMandatory": "Injury Date is required."
}

Rule "ReceivedDateCannotBeAFutureDate" On CapDentalBaseClaimData.receivedDate {
Description "Received Date cannot be a future date"
Assert Today() >= CapDentalBaseClaimData.receivedDate
Error "ReceivedDateCannotBeAFutureDate": "Received Date cannot be a future date."
}

Rule "DefaultIsProcedureAuthorizedAsYes" On CapPetPreauthorizationEntity.isProcedureAuthorized {
  Description "Set default value to true"
  Default To true
}

Rule "HidePriorProsthesisPlacement" On CapDentalProcedureEntity.priorProsthesisPlacementDate {
  Description "Display only when Claim Type is Orthodontic Services"
  When CapDentalClaimDataEntity.transactionType != "OrthodonticServices"
  Set Hidden
}
Please generate the following Kraken rule based on the Kraken rule above: