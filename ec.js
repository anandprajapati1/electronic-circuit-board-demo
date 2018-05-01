var app = angular.module('electronicCircuitApp', [])

app.controller('ECController', function ($scope) {
	// >> Battery module
	$scope.Battery = {
		charge: 1000,
		chargePercent: function () {
			return Math.floor(this.charge * 100 / this.capacity)
		},
		isCharging: false,
		dischargeRate: 0, // neglect auto discharge for now
		intId: 0,
		PlugIn: function () {
			var self = this
			this.intId = setInterval(function () {
				self.isCharging = true
				if ((self.charge / self.capacity) >= 1) {
					// clearInterval(self.intId)
					self.timeRemainingToFull = 0
					$scope.$apply()
					return
				}
				if ((self.capacity - self.charge) < 20)
					self.charge = self.capacity
				else
					self.charge += 20
				self.timeRemainingToFull = (self.capacity - self.charge) / 10
				$scope.$apply()
			}, 100)
		},
		PlugOut: function () {
			this.isCharging = false
			clearInterval(this.intId)
		},
		discharge: function () {
			var self = this
			setInterval(function () {
				if (self.isCharging == false && self.charge > 0)
					self.charge -= self.dischargeRate

				if(self.charge <= 0)
					self.charge = 0;
				$scope.$apply()
			}, 100)
		},
		timeRemainingToFull: 0
	}
	Object.defineProperty($scope.Battery, 'capacity', {
		writable: false,
		value: 4000
	})
	//   Object.defineProperty($scope.Battery, 'intId', {value: 0})

	$scope.chargeSwitchClick = function () {
		if ($scope.Battery.isCharging)
			$scope.Battery.PlugOut()
		else
			$scope.Battery.PlugIn()
	}

	$scope.equipments = []
	var bulb1 = new EC('BULB', 1)
	var bulb2 = new EC('BULB', 2)
	var fan = new EC('FAN', 5)
	$scope.equipments.push(bulb1)
	$scope.equipments.push(bulb2)
	$scope.equipments.push(fan)

	// Equipment class
	function EC(t, cr) {
		var consumptionRate = cr
		this.type = t
		this.isOn = false
		var self = this
		var switchOn = function () {
				$scope.Battery.dischargeRate += consumptionRate
				self.isOn = true
				var intid = setInterval(function () {
					if ($scope.Battery.charge <= 0) {
						clearInterval(intid)
						self.switchToggle()
					}
				}, 100)
			},
			switchOff = function () {
				// prevent negative value for dischargeRate
				if ($scope.Battery.dischargeRate >= consumptionRate)
					$scope.Battery.dischargeRate -= consumptionRate
				self.isOn = false
			}
		this.switchToggle = function () {
			if (self.isOn)
				switchOff()
			else
				switchOn()
		}
	}

	$scope.Battery.discharge()
})