var helper = require("./../acceptance/_helper"),
    app = require("./../../app"),
    Dish = require("./../../models/dish"),
    Order = require("./../../models/order"),
    expect = require("chai").use(require("chai-things")).expect,
    mongodb = require("mongodb"),
    _ = require("underscore")

describe("Waitress", function() {
  describe("Order", function() {
    before(helper.loadFixtures(app))

    it("can be created from specification data", function(done) {
      Order.from(this.anOrderSpecification()).save(function(err, order) {
        expect(err).to.eq(null)
        done()
      })
    })

    it("has dishes with portionsToDeliver", function(done) {
      var portionsToDeliver = 3,
          orderWithThreePortionsOfOneDish = this.anOrderSpecification({
            portions: portionsToDeliver
          })

      Order.from(orderWithThreePortionsOfOneDish).save(function(err, order) {
        expect(order.dishes).all.have.property("portionsToDeliver", portionsToDeliver)
        done()
      })
    })

    it("has dishes with portionsReadyInTheKitchen", function(done) {
      var portionsToDeliver = 3,
          orderWithThreePortionsOfOneDish = this.anOrderSpecification({
            portions: portionsToDeliver
          })

      Order.from(orderWithThreePortionsOfOneDish).save(function(err, order) {
        expect(order.dishes).all.have.property("portionsReadyInTheKitchen", 0)
        done()
      })
    })

    before(function(done) {
      var self = this
      Dish.find().exec(function(err, docs) {
        self.allDishIds = _(docs).chain().pluck("_id").shuffle().value()
        self.anOrderSpecification = function() {
          var dishes = _(arguments).flatten()
          if (dishes.length === 0) {
            dishes = _(self.allDishIds).sample(3).map(function(id) {
              return {
                dish: id,
                portions: _.random(1, 5)
              }
            })
          }
          return {
            table: new mongodb.ObjectID(),
            dishes: dishes.map(function(dishInOrder) {
              if (!dishInOrder.dish) {
                dishInOrder.dish = self.allDishIds.pop()
              }
              return dishInOrder
            })
          }
        }
        done()
      })
    })
  })
})